# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models, security
from routers import auth_router, campus_router
from seed_data import seed

app = FastAPI(title="API Campus C.D. Murense")

# Configuració dinàmica de CORS per a desenvolupament local i desplegaments (Vercel, Render, etc.)
raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if raw_allowed_origins:
    for origin in raw_allowed_origins.split(","):
        o = origin.strip()
        if o and o not in allowed_origins:
            allowed_origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.netlify\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(campus_router.router)


@app.on_event("startup")
def inicialitzar_app():
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

    # Pre-carregar dades de prova per a la demo si la base de dades és nova
    auto_seed = os.getenv("AUTO_SEED", "true").lower() in ("true", "1", "yes")
    if auto_seed:
        try:
            seed()
        except Exception as e:
            print(f"Avís inicialitzant seed data: {e}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API del Campus C.D. Murense funcionant correctament"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}