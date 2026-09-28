# ============================================================
# Dockerfile — Campus C.D. Murense (All-in-One, Render ready)
# ============================================================
# Etapa 1: Compila el frontend de React + Vite
# ============================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

# Instal·la dependències primer (aprofita la cache de Docker)
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copia el codi font i compila per a producció
COPY frontend/ ./
RUN npm run build

# ============================================================
# Etapa 2: Backend FastAPI (Python 3.11-slim)
# ============================================================
FROM python:3.11-slim AS backend

WORKDIR /app

# Instal·la dependències del sistema per psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instal·la dependències Python primer (millor cache de capes)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copia el codi font del backend
COPY backend/ ./

# Copia el frontend compilat a /app/static → FastAPI el serveix com SPA
COPY --from=frontend-builder /build/frontend/dist ./static

# Crea l'usuari no-root per seguretat (millor pràctica en contenidors)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Exposa el port per defecte (Render el sobreescriu amb $PORT)
EXPOSE 8000

# Uvicorn llegeix $PORT dinàmicament; fallback a 8000 en local
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info"]
