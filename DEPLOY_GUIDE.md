# 🚀 Guia Oficial de Llançament i Desplegament — Campus C.D. Murense

Aquesta guia detalla els passos exactes per posar en marxa la web del **Campus C.D. Murense 2027** en producció. 
Gràcies a la connexió directa mitjançant `@supabase/supabase-js`, l'arquitectura és **100% serverless, gratuïta, escalable i sense necessitat de mantenir servidors Python en funcionament**.

---

## 🏆 Arquitectura de Producció

| Component | Proveïdor Recomanat | Cost | Funció |
| :--- | :--- | :--- | :--- |
| **Frontend Web** (React + Vite + TypeScript) | **[Vercel](https://vercel.com)** o Netlify | 0 €/mes | Servit ultra-ràpid amb CDN global, SSL automàtic i enrutament SPA. |
| **Base de Dades i Autenticació** (PostgreSQL) | **[Supabase](https://supabase.com)** | 0 €/mes | Gestió de dades d'inscrits, assistència, taula de pagaments i autenticació Staff. |
| **Emmagatzematge** (Storage) | **Supabase Storage** | 0 €/mes | Guarda de DNIs i comprovants de transferència bancària en buckets privats. |

---

## 📋 Pas 1: Configurar el Projecte a Supabase (2 minuts)

1. Entra a **[supabase.com](https://supabase.com)** i inicia sessió o registra't amb el teu compte de GitHub.
2. Fes clic a **New Project**:
   - **Name**: `campus-cd-murense`
   - **Database Password**: Genera una contrasenya segura i guarda-la.
   - **Region**: Tria Europa Central (**Frankfurt** o **London** per a màxima velocitat a les Illes Balears).
3. Un cop creat el projecte, ves a l'apartat **SQL Editor** del menú lateral esquerre.
4. Fes clic a **New Query**, obre el fitxer [`supabase_schema.sql`](./supabase_schema.sql) del teu repositori, copia tot el seu contingut, enganxa'l a l'editor i fes clic a **Run**.
   - *Això crearà automàticament totes les taules (`inscripcions`, `jugadors`, `tutors`, `assistencia`, `configuracio_campus`), índexs, permisos RLS i la configuració inicial del campus.*
5. Ara ves a **Project Settings** (icona d'engranatge) > **API**:
   - Copia la **Project URL** (ex: `https://xyzproject.supabase.co`).
   - Copia la clau **anon public** (la clau pública segura per al navegador).

---

## 📋 Pas 2: Desplegar el Frontend a Vercel (1 minut)

1. Entra a **[vercel.com](https://vercel.com)** i connecta amb GitHub.
2. Fes clic a **Add New...** > **Project** i selecciona el repositori `campus-murense`.
3. Vercel detectarà automàticament el projecte i el fitxer [`vercel.json`](./vercel.json).
4. A la secció **Environment Variables**, afegeix les dues claus que has copiat de Supabase:
   - **`VITE_SUPABASE_URL`**: `https://teu-projecte.supabase.co`
   - **`VITE_SUPABASE_ANON_KEY`**: `teva_clau_anon_public`
5. Fes clic a **Deploy**.
6. En menys de 30 segons la web estarà en línia amb certificat SSL gratuït!

---

## 🌐 Pas 3: Assignar el Domini Oficial del Club (Opcional)

Perquè la web funcioni sota el domini oficial del club (ex: `campus.cdmurense.com` o `campuscdmurense.cat`):

1. Al panell del teu projecte a Vercel, ves a **Settings** > **Domains**.
2. Introdueix el subdomini (ex: `campus.cdmurense.com`).
3. Vercel et mostrarà un registre DNS tipus **CNAME** (apuntant a `cname.vercel-dns.com`).
4. Entra al panell del teu proveïdor de domini (Nominalia, DonDominio, Cloudflare, etc.) i afegeix el registre CNAME.
5. El certificat SSL Let's Encrypt s'emetrà automàticament en pocs minuts.

---

## 🔑 Credencials i Prova del Panell d'Administració

- **Portal Públic (Famílies)**: `https://el-teu-domini.vercel.app`
  - Les famílies poden formalitzar inscripcions completes (passos 1 a 5).
  - Totes les inscripcions es desen directament a Supabase en temps real.
- **Accés al Panell Staff (Coordinació / Directiva)**:
  - Fes clic a **"Accés Staff"** a la capçalera o ves directament a `/admin`.
  - **Usuari**: `admin@cdmurense.com`
  - Per activar l'inici de sessió amb contrasenya a Supabase Auth:
    - Al panell de Supabase, ves a **Authentication** > **Users** > **Add User** (Create User).
    - Introdueix `admin@cdmurense.com`, la contrasenya que vulguis i marca "Auto Confirm User".

---

## 🧪 Com provar el projecte en local abans del llançament

Pots executar i provar la web al teu ordinador en qualsevol moment:

```bash
# 1. Entra a la carpeta del frontend
cd frontend

# 2. Assegura't de tenir les dependències instal·lades
npm install

# 3. Arranca el servidor de desenvolupament
npm run dev
```

La web s'obrirà a `http://localhost:5173`.
