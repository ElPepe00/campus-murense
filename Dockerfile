# ==============================================================================
# Fase 1: Compilació del Frontend (React + Vite)
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Fase 2: Backend Python (FastAPI + Frontend Unificat)
# ==============================================================================
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
# Copiar el frontend compilat dins la carpeta static del backend
COPY --from=frontend-builder /app/frontend/dist ./static

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
