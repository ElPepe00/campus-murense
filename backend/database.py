# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./campus.db"
)

# Compatibilitat amb proveïdors cloud (Render, Heroku, Supabase, Neon) que usen el prefix 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine_kwargs.pop("pool_pre_ping", None)

# Creació del motor de connexió a la base de dades
engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)

# Creador de sessions locals
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base per als models de SQLAlchemy
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()