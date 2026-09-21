# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models, security
from routers import auth_router

app = FastAPI(title="API Campus C.D. Murense")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)

@app.on_event("startup")
def inicialitzar_admin():
    # Assegurar que les taules estiguin creades
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_existent = db.query(models.Usuari).filter(
            models.Usuari.email == "admin@cdmurense.com"
        ).first()
        
        if not admin_existent:
            admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD", "ClaveInicialSegura2027!")
            admin_inicial = models.Usuari(
                nom_complet="Coordinador Campus",
                email="admin@cdmurense.com",
                password_hash=security.get_password_hash(admin_password),
                rol=models.RolUsuariEnum.ADMIN,
                actiu=True
            )
            db.add(admin_inicial)
            db.commit()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API del Campus funcionant"}