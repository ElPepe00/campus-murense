# 🚀 Guia de Desplegament Gratuït (Beta Demo) — Campus C.D. Murense

Aquesta guia explica pas a pas com llançar la web del Campus C.D. Murense de forma **100% gratuïta**, segura i ràpida per a la demo amb el client final.

---

## 🏆 Arquitectura Recomanada (100% Gratuïta i Estable)

| Component | Proveïdor Recomanat | Pla Gratuït | Avantatges |
| :--- | :--- | :--- | :--- |
| **Frontend** (React + Vite) | **[Vercel](https://vercel.com)** | Hobby (0 €/mes) | Càrrega ultra ràpida a escala mundial, SSL automàtic, SPA rewrites preparats. |
| **Backend** (FastAPI) | **[Render](https://render.com)** | Free Web Service | 512 MB RAM, suport Python natiu/Docker, desplega directe des de GitHub. |
| **Base de Dades** (PostgreSQL) | **[Neon.tech](https://neon.tech)** | Free Tier permanent | 0.5 GB Postgres serverless, permanent (no caduca), certificat SSL nadiu. |

*(Alternativa "Tot en Un": Es pot desplegar tot directament a **Render.com** usant el fitxer [`render.yaml`](./render.yaml) inclòs al projecte).*

---

## 📋 Pas 1: Crear la Base de Dades PostgreSQL Gratuïta (Neon.tech)

1. Entra a **[neon.tech](https://neon.tech)** i crea un compte gratuït (pots iniciar sessió amb GitHub).
2. Fes clic a **Create Project**:
   - Nom del projecte: `campus-murense-db`
   - Regió: Tria Europa (`Frankfurt` o `Ireland` per menor latència).
3. Copia la cadena de connexió (**Connection Details**), que tindrà un format com aquest:
   ```text
   postgresql://campus_owner:AbCdEf123456@ep-cool-dawn-123456.eu-central-1.neon.tech/neondb?sslmode=require
   ```
*(Aquesta serà la teva variable `DATABASE_URL`)*.

---

## 📋 Pas 2: Desplegar el Backend FastAPI a Render.com

1. Entra a **[render.com](https://render.com)** i inicia sessió amb el teu GitHub.
2. Fes clic a **New +** > **Web Service**.
3. Selecciona el teu repositori de GitHub (`ElPepe00/campus-murense`).
4. Configura el servei:
   - **Name**: `campus-murense-backend`
   - **Region**: Frankfurt (EU Central)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. A l'apartat **Environment Variables**, afegeix:
   - `DATABASE_URL`: *(La URL que has copiat de Neon al Pas 1)*
   - `SECRET_KEY`: *(Una clau aleatòria qualsevol, ex: `campus_murense_secret_key_demo_2027`)*
   - `ADMIN_DEFAULT_PASSWORD`: `ClaveInicialSegura2027!`
   - `AUTO_SEED`: `true` *(Carregarà automàticament els alumnes, grups i assistències de prova)*
6. Fes clic a **Deploy Web Service**.
7. Un cop desplegat, copia l'adreça URL generada per Render (ex: `https://campus-murense-backend.onrender.com`).

---

## 📋 Pas 3: Desplegar el Frontend a Vercel

1. Entra a **[vercel.com](https://vercel.com)** i connecta el teu compte de GitHub.
2. Fes clic a **Add New...** > **Project**.
3. Importa el repositori `ElPepe00/campus-murense`.
4. A la pantalla de configuració:
   - **Root Directory**: Fes clic a *Edit* i selecciona la carpeta `frontend`.
   - **Framework Preset**: Detectarà `Vite` automàticament.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Desplega l'apartat **Environment Variables** i afegeix:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://campus-murense-backend.onrender.com` *(La URL del teu backend a Render, sense barra final)*
6. Fes clic a **Deploy**.
7. En 30 segons tindràs la teva web llesta a una URL com `https://campus-murense.vercel.app`!

---

## 🔑 Credencials per a la Demo de l'Usuari Final

Perquè el client pugui provar tant la part pública com el panell d'administració:

- **Portal Públic (Famílies)**: `https://la-teva-web.vercel.app`
  - Pot omplir el formulari complet d'inscripció online (passos 1 a 5).
  - En confirmar, l'infant es desa a la base de dades i apareix al panell de control.
- **Accés al Panell Staff (Coordinació)**:
  - Es pot entrar des del botó **"Accés Staff"** del menú superior o del peu de pàgina, o anant directament a `/admin`.
  - **Usuari**: `admin@cdmurense.com`
  - **Contrasenya**: `ClaveInicialSegura2027!`
  *(La pantalla d'inici de sessió ja inclou una caixa d'ajuda visual amb aquestes dades per comoditat)*.

---

## 🛡️ Modificacions de Seguretat i Estabilitat Realitzades al Codi

1. **CORS Dinàmic i Segur**: Backend configurat per acceptar peticions de desenvolupament local (`localhost`) i dominis cloud de producció i previsualització (`*.vercel.app`, `*.onrender.com`, etc.).
2. **Compatibilitat de Base de Dades**: Connexió robusta a PostgreSQL amb gestió automàtica de prefixos `postgres://` / `postgresql://` i verificació de connexions actives (`pool_pre_ping`).
3. **Càrrega Automàtica de Dades de Prova (`AUTO_SEED`)**: En arrencar sobre una base de dades neta, el backend injecta automàticament els alumnes, grups i dades d'assistència perquè el client mai vegi la demo buida.
4. **Endpoint d'Inscripcions Reals**: El formulari públic de famílies envia les dades al backend i registra automàticament l'infant, tutor i assistència inicial.
5. **Configuració SPA per Evitar Errors 404**: S'han afegit els fitxers `vercel.json` i `_redirects` per assegurar que en refrescar o navegar directament a `/admin` o `/inscripcio` no es produeixi cap error de pàgina no trobada.
6. **URL d'API Centralitzada**: Frontend preparat per canviar entre entorn local i entorns cloud via la variable d'entorn `VITE_API_URL`.
