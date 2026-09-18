# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://murense_user:supersecretpassword@db:5432/campus_db"
)

# Creació del motor de connexió a PostgreSQL
engine = create_engine(DATABASE_URL)

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