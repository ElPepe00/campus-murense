# backend/database.py
import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Normalització de la DATABASE_URL
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campus.db")

# 1. Render i proveïdors cloud (Heroku, Railway, Neon, Supabase) retornen
#    'postgres://' que SQLAlchemy 1.4+ ja no accepta.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    log.info("DATABASE_URL: prefix 'postgres://' convertit a 'postgresql://'.")

# 2. Forçar el driver psycopg2 explícitament per a totes les URL de PostgreSQL.
#    Això evita l'error "Could not load backend 'psycopg'" quan SQLAlchemy
#    intenta usar el driver psycopg3 (no instal·lat) en lloc de psycopg2-binary.
#
#    Transformació:
#      postgresql://...      → postgresql+psycopg2://...
#      postgresql+psycopg://... → postgresql+psycopg2://... (per si ve psycopg3)
#
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    log.info("DATABASE_URL: driver forçat a psycopg2.")
elif DATABASE_URL.startswith("postgresql+psycopg://"):
    # psycopg3 → convertir a psycopg2
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)
    log.info("DATABASE_URL: driver psycopg3 convertit a psycopg2.")

# ---------------------------------------------------------------------------
# Configuració del motor SQLAlchemy
# ---------------------------------------------------------------------------
_connect_args: dict = {}
_engine_kwargs: dict = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    # SQLite no admet múltiples fils sense aquest flag
    _connect_args["check_same_thread"] = False
    # pool_pre_ping no és necessari amb SQLite
    _engine_kwargs.pop("pool_pre_ping", None)

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    **_engine_kwargs,
)

# Verificació de connexió en l'arrencada — detecta errors de configuració aviat
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    _db_type = "SQLite" if DATABASE_URL.startswith("sqlite") else "PostgreSQL (psycopg2)"
    log.info(f"Connexió a la base de dades establerta: {_db_type}.")
except Exception as exc:
    log.error(
        f"ERROR: No s'ha pogut connectar a la base de dades.\n"
        f"  URL activa: {DATABASE_URL[:60]}...\n"
        f"  Detall: {exc}"
    )

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