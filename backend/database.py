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
    # Per seguretat (CWE-532), mai mostram contrasenyes en els logs
    try:
        _safe_url = engine.url.render_as_string(hide_password=True)
    except Exception:
        import re
        _safe_url = re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", DATABASE_URL)
    log.error(
        f"ERROR: No s'ha pogut connectar a la base de dades.\n"
        f"  URL activa: {_safe_url}\n"
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


def run_migrations():
    """Executa migracions lleugeres d'esquema per a SQLite i PostgreSQL si calen noves columnes."""
    import uuid
    with engine.connect() as conn:
        # 1. Comprovar columnes existents a 'inscripcions'
        try:
            is_sqlite = DATABASE_URL.startswith("sqlite")
            if is_sqlite:
                cols_res = conn.execute(text("PRAGMA table_info(inscripcions)")).fetchall()
                existing_cols = {row[1] for row in cols_res}
            else:
                cols_res = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name='inscripcions'"
                )).fetchall()
                existing_cols = {row[0] for row in cols_res}

            if existing_cols:
                if "edit_token" not in existing_cols:
                    conn.execute(text("ALTER TABLE inscripcions ADD COLUMN edit_token VARCHAR(64)"))
                    log.info("Columna 'edit_token' afegida a 'inscripcions'.")
                if "setmana_seleccionada" not in existing_cols:
                    conn.execute(text("ALTER TABLE inscripcions ADD COLUMN setmana_seleccionada INTEGER DEFAULT 1"))
                    log.info("Columna 'setmana_seleccionada' afegida a 'inscripcions'.")
                if "dinar_dies" not in existing_cols:
                    conn.execute(text("ALTER TABLE inscripcions ADD COLUMN dinar_dies TEXT"))
                    log.info("Columna 'dinar_dies' afegida a 'inscripcions'.")
                if "dinar_dies_total" not in existing_cols:
                    conn.execute(text("ALTER TABLE inscripcions ADD COLUMN dinar_dies_total INTEGER DEFAULT 0"))
                    log.info("Columna 'dinar_dies_total' afegida a 'inscripcions'.")

                # Generar tokens per a inscripcions que no en tinguin
                rows_without_token = conn.execute(text(
                    "SELECT id FROM inscripcions WHERE edit_token IS NULL"
                )).fetchall()
                for (row_id,) in rows_without_token:
                    new_tok = str(uuid.uuid4())
                    conn.execute(
                        text("UPDATE inscripcions SET edit_token = :t WHERE id = :id"),
                        {"t": new_tok, "id": row_id}
                    )
                if rows_without_token:
                    log.info(f"S'han assignat edit_token a {len(rows_without_token)} inscripcions existents.")

                conn.commit()
        except Exception as e:
            log.warning(f"Avís durant migració d'esquema (pot ser que la taula encara no existeixi): {e}")