# backend/main.py
import os
import logging
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ---------------------------------------------------------------------------
# Càrrega automàtica de fitxers .env en entorns locals
# ---------------------------------------------------------------------------
for _candidate in [
    os.path.join(os.path.dirname(__file__), ".env"),
    os.path.join(os.path.dirname(__file__), "..", ".env"),
]:
    if os.path.isfile(_candidate):
        try:
            with open(_candidate, "r", encoding="utf-8") as _f:
                for _line in _f:
                    _line = _line.strip()
                    if _line and not _line.startswith("#") and "=" in _line:
                        _k, _v = _line.split("=", 1)
                        _k = _k.strip()
                        _v = _v.strip().strip("'\"")
                        if _k and _k not in os.environ:
                            os.environ[_k] = _v
        except Exception:
            pass

# ---------------------------------------------------------------------------
# Validació d'entorn obligatòria en arrencar
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    logging.basicConfig(stream=sys.stdout, level=logging.WARNING)
    logging.warning(
        "[AVÍS] SECRET_KEY no definida. Usant clau per defecte per a la demo. "
        "Defineix SECRET_KEY com a variable d'entorn en producció."
    )
    os.environ["SECRET_KEY"] = "campus_murense_demo_fallback_secret_key_not_for_production"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logging.basicConfig(stream=sys.stdout, level=logging.WARNING)
    logging.warning(
        "[AVÍS] DATABASE_URL no definida. Usant SQLite local (campus.db). "
        "Defineix DATABASE_URL com a variable d'entorn en producció per usar PostgreSQL."
    )

from database import engine, Base, SessionLocal
import models, security
from routers import auth_router, campus_router
from seed_data import seed

# ---------------------------------------------------------------------------
# App FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title="API Campus C.D. Murense",
    description="API de gestió del Campus d'Estiu del Club Esportiu C.D. Murense",
    version="1.0.0-beta",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# Capçaleres de Seguretat HTTP (Security Headers) & Forçar HTTPS
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Forçar HTTPS si ve d'un proxy de producció (Render, Cloudflare, Vercel)
    proto = request.headers.get("x-forwarded-proto")
    if proto == "http" and os.getenv("ENVIRONMENT", "").lower() == "production":
        from fastapi.responses import RedirectResponse
        url = request.url.replace(scheme="https")
        return RedirectResponse(url=str(url), status_code=301)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    return response

# ---------------------------------------------------------------------------
# CORS — protecció estricta contra orígens no autoritzats
# ---------------------------------------------------------------------------
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
_allowed_origins: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
for _o in _raw_origins.split(","):
    _o = _o.strip()
    if _o and _o not in _allowed_origins:
        _allowed_origins.append(_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=(
        r"^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$"
        r"|^https:\/\/(campus-murense[a-zA-Z0-9-]*\.(vercel\.app|onrender\.com))$"
    ),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers d'API
# ---------------------------------------------------------------------------
app.include_router(auth_router.router)
app.include_router(campus_router.router)


# ---------------------------------------------------------------------------
# Lifecycle: creació de taules + admin + seed
# ---------------------------------------------------------------------------
@app.on_event("startup")
def inicialitzar_app() -> None:
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    log = logging.getLogger(__name__)

    try:
        Base.metadata.create_all(bind=engine)
        log.info("Taules de la base de dades verificades/creades.")
    except Exception as exc:
        log.error(f"Error creant taules: {exc}")
        return

    db = SessionLocal()
    try:
        admin = db.query(models.Usuari).filter(
            models.Usuari.email == "admin@cdmurense.com"
        ).first()
        if not admin:
            pwd = os.getenv("ADMIN_DEFAULT_PASSWORD", "ClaveInicialSegura2027!")
            db.add(models.Usuari(
                nom_complet="Coordinador Campus",
                email="admin@cdmurense.com",
                password_hash=security.get_password_hash(pwd),
                rol=models.RolUsuariEnum.ADMIN,
                actiu=True,
            ))
            db.commit()
            log.info("Usuari admin creat: admin@cdmurense.com")
        else:
            log.info("Usuari admin ja existeix.")
    except Exception as exc:
        log.error(f"Error creant admin: {exc}")
        db.rollback()
    finally:
        db.close()

    if os.getenv("AUTO_SEED", "true").lower() in ("true", "1", "yes"):
        try:
            seed()
            log.info("Seed data carregada.")
        except Exception as exc:
            log.warning(f"Seed data (avís, no crític): {exc}")


# ---------------------------------------------------------------------------
# Health-check (Render el necessita per verificar que el servei arrenca bé)
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Sistema"], include_in_schema=False)
def health_check():
    return {"status": "healthy"}


# ---------------------------------------------------------------------------
# Servei de la SPA de React (mode All-in-One)
# Quan el Dockerfile copia dist/ a backend/static/, FastAPI serveix la web.
# ---------------------------------------------------------------------------
_static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(_static_dir):
    _assets_dir = os.path.join(_static_dir, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        # No interceptar endpoints d'API ni docs
        if (
            full_path.startswith("api/")
            or full_path in ("health", "docs", "redoc", "openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")
        
        static_abs = os.path.abspath(_static_dir)
        target = os.path.abspath(os.path.join(static_abs, full_path.lstrip("/\\")))
        # Protecció estricta contra Path Traversal (CWE-22)
        if not (target == static_abs or target.startswith(static_abs + os.path.sep)):
            raise HTTPException(status_code=403, detail="Forbidden")

        if full_path and os.path.isfile(target):
            return FileResponse(target)
        # SPA fallback → index.html
        return FileResponse(os.path.join(static_abs, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    def read_root():
        return {
            "status": "ok",
            "message": "API del Campus C.D. Murense funcionant correctament",
            "docs": "/api/docs",
        }
