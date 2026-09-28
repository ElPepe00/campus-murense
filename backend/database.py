# backend/database.py
import os
import logging
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# URL de la base de dades
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campus.db")

# Render (i alguns proveïdors cloud) retornen 'postgres://' que SQLAlchemy no suporta.
# El reemplaçament és transparent i sense efectes laterals.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    log.info("DATABASE_URL: prefix 'postgres://' convertit a 'postgresql://'.")

# ---------------------------------------------------------------------------
# Motor SQLAlchemy
# ---------------------------------------------------------------------------
_connect_args: dict = {}
_engine_kwargs: dict = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    # SQLite no suporta connexions múltiples des de fils diferents sense aquest flag
    _connect_args["check_same_thread"] = False
    # pool_pre_ping no és necessari amb SQLite i genera un warning
    _engine_kwargs.pop("pool_pre_ping", None)

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    **_engine_kwargs,
)

# Verifica connexió i loga el tipus de base de dades actiu
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    _db_type = "SQLite" if DATABASE_URL.startswith("sqlite") else "PostgreSQL"
    log.info(f"Connexió a la base de dades establerta ({_db_type}).")
except Exception as exc:
    log.error(f"No s'ha pogut connectar a la base de dades: {exc}")

# ---------------------------------------------------------------------------
# Sessió i Base declarativa
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency per a FastAPI. Proporciona una sessió de BD i la tanca al final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()