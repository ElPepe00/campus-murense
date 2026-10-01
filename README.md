<div align="center">

  <img src="./frontend/public/logo.png" alt="Campus C.D. Murense" width="160" />

  # ⚽ Campus d'Estiu C.D. Murense
  
  **Plataforma web integral de gestió, inscripcions i administració per al campus d'estiu del Club Esportiu C.D. Murense (Muro, Mallorca).**

  [![React](https://img.shields.io/badge/Frontend-React_19_%7C_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  <p align="center">
    <a href="#-característiques-principals">Característiques</a> •
    <a href="#-arquitectura-i-stack-tecnològic">Stack Tecnològic</a> •
    <a href="#-inici-ràpid-desenvolupament-local">Instal·lació Local</a> •
    <a href="#-variables-dentorn">Variables d'Entorn</a> •
    <a href="#-panell-de-control-i-credencials">Credencials</a> •
    <a href="#-desplegament-al-cloud">Desplegament</a>
  </p>

</div>

---

## 📌 Descripció del Projecte

Aquesta aplicació web full-stack ha estat dissenyada específicament per digitalitzar i agilitzar tot el procés d'organització del **Campus d'Estiu del C.D. Murense**. Permet a les famílies realitzar la inscripció i pagament de manera intuïtiva des de qualsevol dispositiu, i a l'equip de coordinació i monitors gestionar alumnes, assistències diàries, cobraments i informes en temps real.

---

## ✨ Característiques Principals

### 👨‍👩‍👧‍👦 Portal Públic (Famílies)
* **Landing Page Interactiva:** Informació detallada sobre dates, preus, serveis (menjador, escoleta matinera, piscina diària, excursions) i galeria.
* **Assistent d'Inscripció en 5 Passos:**
  1. *Dades de l'infant* (edat de 4 a 14 anys, talla de roba, observacions).
  2. *Dades dels tutors* (contacte d'emergència, telèfons, DNI/NIE).
  3. *Torns i Serveis* (selecció de setmanes, servei de menjador i escoleta matinera amb càlcul de preu dinàmic).
  4. *Salut i Autoritzacions* (al·lèrgies, intoleràncies, medicació, drets d'imatge i protecció de dades RGPD).
  5. *Resum i Confirmació* (desglossament de preus, descomptes per germans/socis i mètode de pagament).
* **Canal de Notícies i Actualitzacions:** Avisos sobre excursions, partits i esdeveniments especials.
* **Integració amb WhatsApp:** Botó flotant per a consultes directes amb la coordinació del campus.
* **Compliment Legal i RGPD:** Pàgines d'Avís Legal, Política de Privacitat i bàner de gestió de Cookies.

### 🛡️ Panell d'Administració (`/admin`)
* **Tauler de Control (Dashboard):** Mètriques clau en temps real (inscrits totals, ingressos, ràtio d'assistència, torns actius).
* **Gestió d'Alumnes:** Llistat complet amb cercador i filtres per edat, grup i estat de pagament, a més de fitxes detallades per infant.
* **Control d'Assistències Diàries:** Registre d'entrades i sortides amb marcatge ràpid d'assistència/absència.
* **Gestió de Pagaments:** Seguiment d'estats (pendent, pagat, transferència bancària) i control de deutes.
* **Informes i Exportació:** Generació d'informes resum per a monitors i cuina (al·lèrgies, menús especials).
* **Configuració del Campus:** Paràmetres generals, places màximes, preus per setmana i serveis addicionals.

---

## 🛠️ Arquitectura i Stack Tecnològic

```mermaid
graph TD
    Client[Navegador Web / Mòbil] -->|HTTPS| Frontend[React 19 + Vite SPA]
    Frontend -->|REST API + JWT| Backend[FastAPI Backend - Python 3]
    Backend -->|SQLAlchemy ORM| DB[(PostgreSQL / SQLite)]
    Backend -->|Seed Automàtic| Seed[Dades de Prova Inicials]
```

| Capa | Tecnologia | Descripció |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Interfície SPA ultra ràpida amb TypeScript |
| **Encaminament** | [React Router 7](https://reactrouter.com/) | Navegació fluida per a rutes públiques i privades |
| **Iconografia** | [Lucide React](https://lucide.dev/) | Icones vectorials modernes i consistents |
| **Estils** | Vanilla CSS modular | Disseny personalitzat amb tokens CSS, suport responsive i dark accents |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | Framework asíncron de Python d'alt rendiment |
| **ORM / Dades** | [SQLAlchemy](https://www.sqlalchemy.org/) + [Pydantic v2](https://docs.pydantic.dev/) | Validació estricta de tipus i models de base de dades |
| **Seguretat** | OAuth2 / JWT + Passlib (Bcrypt) | Encriptació de credencials i sessions autenticades |
| **Base de Dades** | PostgreSQL (Prod) / SQLite (Dev) | Emmagatzematge persistent i relacional |
| **Contenidors** | [Docker](https://www.docker.com/) & Docker Compose | Entorn unificat per a desenvolupament i producció |

---

## 📂 Estructura del Repositori

```text
campus-murense/
├── backend/                  # Servidor API FastAPI
│   ├── routers/              # Rutes de l'API (auth_router, campus_router)
│   ├── auth.py               # Dependències d'autenticació i JWT
│   ├── database.py           # Configuració del motor SQLAlchemy
│   ├── main.py               # Punt d'entrada de FastAPI i middlewares CORS
│   ├── models.py             # Taules de la BBDD (Usuari, Alumne, Assistència...)
│   ├── schemas.py            # Esquemes Pydantic d'entrada/sortida
│   ├── security.py           # Gestió de hashes de contrasenya
│   ├── seed_data.py          # Càrrega inicial de dades de prova (AUTO_SEED)
│   ├── requirements.txt      # Dependències Python
│   └── Dockerfile            # Imatge Docker del backend
├── frontend/                 # Client web React + Vite
│   ├── public/               # Fitxers estàtics (logotip, favicon, manifest, robots.txt)
│   ├── src/
│   │   ├── api/              # Clients Axios/Fetch per connectar amb el backend
│   │   ├── components/       # Navbar, Sidebar, Footer, Banners, Botons
│   │   ├── context/          # Context d'Autenticació (AuthContext)
│   │   ├── pages/
│   │   │   ├── admin/        # Panell intern (Dashboard, Alumnes, Assistència, Cobraments)
│   │   │   └── public/       # Pàgines públiques i Wizard d'Inscripció
│   │   ├── types/            # Definicions de TypeScript
│   │   └── index.css         # Sistema de disseny complet
│   └── package.json          # Dependències de Node.js
├── docker-compose.yml        # Orquestració de contenidors (DB + Backend + Frontend)
├── DEPLOY_GUIDE.md           # Guia detallada de desplegament gratuït al núvol
└── README.md                 # Documentació del projecte
```

---

## 🚀 Inici Ràpid (Desenvolupament Local)

Pots arrencar el projecte de dues formes: mitjançant **Docker Compose** (recomanat per comoditat) o **manualment**.

### Opció A: Amb Docker Compose (Recomanat)

Assegura't de tenir instal·lat [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. **Clona el repositori:**
   ```bash
   git clone https://github.com/ElPepe00/campus-murense.git
   cd campus-murense
   ```

2. **Crea el fitxer d'entorn `.env` a l'arrel:**
   ```env
   POSTGRES_USER=murense_user
   POSTGRES_PASSWORD=una_contrasenya_segura
   POSTGRES_DB=campus_db
   SECRET_KEY=la_teva_clau_secreta_jwt_local
   ADMIN_DEFAULT_PASSWORD=ClaveInicialSegura2027!
   AUTO_SEED=true
   ```

3. **Inicia els serveis:**
   ```bash
   docker compose up --build
   ```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Opció B: Execució Manual (Sense Docker)

#### 1. Backend (FastAPI)
```bash
cd backend

# Crea i activa un entorn virtual
python -m venv venv
# A Windows:
.\venv\Scripts\activate
# A Linux/macOS:
source venv/bin/activate

# Instal·la dependències
pip install -r requirements.txt

# Configura les variables (o crea un .env basat en .env.example)
# Executa el servidor de desenvolupament:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend (React + Vite)
Obre un altre terminal:
```bash
cd frontend

# Instal·la dependències
npm install

# Inicia el servidor de desenvolupament
npm run dev
```

---

## ⚙️ Variables d'Entorn

### Backend (`backend/.env`)
| Variable | Descripció | Exemple |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de connexió a PostgreSQL o SQLite | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Clau privada per xifrar tokens JWT | `cadena_aleatoria_super_secreta` |
| `ADMIN_DEFAULT_PASSWORD` | Contrasenya creada per a l'usuari admin inicial | `ClaveInicialSegura2027!` |
| `AUTO_SEED` | Carrega dades de prova si la base de dades és buida | `true` |
| `ALLOWED_ORIGINS` | Dominis autoritzats per a CORS (separats per coma) | `http://localhost:5173,https://la-teva-web.vercel.app` |

### Frontend (`frontend/.env` o variables de Vercel)
| Variable | Descripció | Exemple |
| :--- | :--- | :--- |
| `VITE_API_URL` | Adreça base de l'API de backend | `http://localhost:8000` o `https://backend.onrender.com` |

---

## 🔑 Panell de Control i Credencials

Per accedir a l'administració (`/admin` o clic a **"Accés Staff"** a la capçalera):

* **Usuari**: `admin@cdmurense.com`
* **Contrasenya**: `ClaveInicialSegura2027!` *(o el valor definit a `ADMIN_DEFAULT_PASSWORD`)*

> [!NOTE]
> En el primer llançament amb `AUTO_SEED=true`, la base de dades s'inicialitza automàticament amb aquest usuari administrador i un conjunt d'infants inscrits per facilitar les proves immediates.

---

## 🌐 Desplegament al Cloud

Aquest projecte està totalment preparat per a un desplegament 100% gratuït i d'alt rendiment:

* **Frontend**: Desplegament a [Vercel](https://vercel.com) amb configuració SPA (`vercel.json` i `_redirects`).
* **Backend**: Desplegament a [Render](https://render.com) amb suport natiu per a Python o Docker.
* **Base de Dades**: PostgreSQL gratuït a [Neon.tech](https://neon.tech) o Supabase.

📖 Consulta la **[Guia Completa de Desplegament (DEPLOY_GUIDE.md)](./DEPLOY_GUIDE.md)** per veure les instruccions pas a pas.

---

## 📄 Llicència i Drets d'Autor

© 2027 **Club Esportiu C.D. Murense**. Tots els drets reservats.  
Desenvolupat per a la gestió esportiva i formativa del municipi de Muro (Mallorca).
