-- ==============================================================================
-- CAMPUS C.D. MURENSE 2027 — ESQUEMA DE BASE DE DADES PER A SUPABASE
-- ==============================================================================
-- Aquest script configura totes les taules, relacions, índexs i polítiques
-- de seguretat RLS necessàries per executar el campus de forma serverless.
--
-- Execució: Copia i enganxa aquest codi a l'apartat 'SQL Editor' del teu panell de Supabase.
-- ==============================================================================

-- 1. Habilitar extensió per a UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TAULES PRINCIPALS
-- ==============================================================================

-- Taula d'edicions de l'activitat
CREATE TABLE IF NOT EXISTS public.edicions_activitat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL DEFAULT 'Campus d''Estiu 2027',
    any INT NOT NULL DEFAULT 2027,
    data_inici DATE DEFAULT '2027-06-23',
    data_fi DATE DEFAULT '2027-07-31',
    activa BOOLEAN DEFAULT true
);

-- Taula de tutors legals
CREATE TABLE IF NOT EXISTS public.tutors (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefon_principal VARCHAR(20) NOT NULL,
    telefon_secundari VARCHAR(20),
    es_tutor_legal BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutors_email ON public.tutors(email);

-- Taula de jugadors / infants inscrits
CREATE TABLE IF NOT EXISTS public.jugadors (
    id SERIAL PRIMARY KEY,
    tutor_id INT REFERENCES public.tutors(id) ON DELETE CASCADE,
    nom_complet VARCHAR(120) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    data_naixement DATE NOT NULL,
    edat INT NOT NULL,
    poblacio VARCHAR(80) NOT NULL DEFAULT 'Muro',
    club_procedencia VARCHAR(100) DEFAULT 'C.D. MURENSE',
    alergies TEXT,
    malalties TEXT,
    talla_roba VARCHAR(10) NOT NULL DEFAULT '8-10',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jugadors_dni ON public.jugadors(dni);
CREATE INDEX IF NOT EXISTS idx_jugadors_tutor ON public.jugadors(tutor_id);

-- Persones autoritzades per a recollir l'infant
CREATE TABLE IF NOT EXISTS public.persones_autoritzades (
    id SERIAL PRIMARY KEY,
    jugador_id INT NOT NULL REFERENCES public.jugadors(id) ON DELETE CASCADE,
    nom_complet VARCHAR(120) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    parentiu VARCHAR(50) DEFAULT 'Familiar'
);

CREATE INDEX IF NOT EXISTS idx_autoritzats_jugador ON public.persones_autoritzades(jugador_id);

-- Inscripcions oficials i serveis contractats
CREATE TABLE IF NOT EXISTS public.inscripcions (
    id SERIAL PRIMARY KEY,
    edit_token VARCHAR(64) UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
    jugador_id INT NOT NULL REFERENCES public.jugadors(id) ON DELETE CASCADE,
    edicio_id INT NOT NULL REFERENCES public.edicions_activitat(id) ON DELETE CASCADE,
    grup_assignat VARCHAR(20) DEFAULT 'Sense Grup',
    
    -- Autoritzacions legals
    autoritzacio_imatges BOOLEAN DEFAULT true,
    autoritzacio_sortir_sol BOOLEAN DEFAULT false,
    autoritzacio_sortides BOOLEAN DEFAULT true,
    servei_piscina VARCHAR(20) DEFAULT 'SI', -- 'SI', 'NO', 'SI_MANIGUETS'
    
    -- Serveis contractats
    servei_menjador BOOLEAN DEFAULT false,
    dinar_dies TEXT, -- JSON Array amb els dies ['2027-06-28', ...] o ['Dilluns', ...]
    dinar_dies_total INT DEFAULT 0,
    intolerancies_menjador TEXT,
    servei_matinera BOOLEAN DEFAULT false,
    
    -- Excursions
    excursio_30_06 BOOLEAN DEFAULT false,
    excursio_07_07 BOOLEAN DEFAULT false,
    
    -- Tarifes i Torns (1 setmana per inscripció)
    setmana_seleccionada INT NOT NULL DEFAULT 1,
    setmanes_contractades INT NOT NULL DEFAULT 1,
    descompte_aplicat VARCHAR(30) DEFAULT 'CAP', -- 'CAP', 'MURENSE', 'FAMILIA_NOMBROSA'
    preu_total NUMERIC(10, 2) NOT NULL DEFAULT 110.00,
    estat_pagament VARCHAR(20) DEFAULT 'PENDENT', -- 'PENDENT', 'PAGAT', 'REVISIO', 'REBUTJAT'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscripcions_token ON public.inscripcions(edit_token);
CREATE INDEX IF NOT EXISTS idx_inscripcions_jugador ON public.inscripcions(jugador_id);
CREATE INDEX IF NOT EXISTS idx_inscripcions_pagament ON public.inscripcions(estat_pagament);

-- Registre diari d'assistència
CREATE TABLE IF NOT EXISTS public.registres_assistencia (
    id SERIAL PRIMARY KEY,
    jugador_id INT NOT NULL REFERENCES public.jugadors(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    estat VARCHAR(20) DEFAULT 'ABSENT', -- 'PRESENT', 'ABSENT', 'JUSTIFICAT'
    hora_entrada TIME,
    hora_sortida TIME,
    observacions VARCHAR(255),
    CONSTRAINT uix_jugador_dia UNIQUE (jugador_id, data)
);

CREATE INDEX IF NOT EXISTS idx_assistencia_data ON public.registres_assistencia(data);
CREATE INDEX IF NOT EXISTS idx_assistencia_jugador ON public.registres_assistencia(jugador_id);

-- Configuració dinàmica del Campus (preus, comptes bancaris, torns)
CREATE TABLE IF NOT EXISTS public.configuracio_campus (
    id SERIAL PRIMARY KEY,
    clau VARCHAR(50) UNIQUE NOT NULL DEFAULT 'general',
    valors_json TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missatges rebuts des del formulari de contacte
CREATE TABLE IF NOT EXISTS public.missatges_contacte (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefon VARCHAR(25),
    assumpte VARCHAR(150),
    missatge TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuaris i personal administratiu (Staff, Coordinadors, Monitors)
CREATE TABLE IF NOT EXISTS public.usuaris (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    rol VARCHAR(20) DEFAULT 'MONITOR', -- 'ADMIN', 'MONITOR'
    actiu BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuaris_email ON public.usuaris(email);

-- ==============================================================================
-- 3. POLÍTIQUES DE SEGURETAT RLS (ROW LEVEL SECURITY)
-- ==============================================================================

ALTER TABLE public.edicions_activitat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persones_autoritzades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripcions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registres_assistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracio_campus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missatges_contacte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuaris ENABLE ROW LEVEL SECURITY;

-- Polítiques públiques (anon) per al portal de famílies
CREATE POLICY "Permetre lectura pública d'edicions actives"
ON public.edicions_activitat FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permetre lectura pública de la configuració"
ON public.configuracio_campus FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permetre creació pública d'inscripcions i tutors"
ON public.tutors FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permetre cerca de tutors existents per email"
ON public.tutors FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permetre actualització de telèfons del tutor per modificació"
ON public.tutors FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Permetre creació pública de jugadors"
ON public.jugadors FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permetre lectura de jugadors per fitxa o llistat"
ON public.jugadors FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permetre actualització de dades mèdiques i talla de jugador"
ON public.jugadors FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Permetre creació i lectura de persones autoritzades"
ON public.persones_autoritzades FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permetre creació i lectura pública d'inscripcions"
ON public.inscripcions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permetre lectura i marcatge d'assistència"
ON public.registres_assistencia FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permetre enviament de missatges de contacte"
ON public.missatges_contacte FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permetre gestió de configuració a authenticated"
ON public.configuracio_campus FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permetre lectura de perfil d'usuari staff"
ON public.usuaris FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permetre gestió d'usuaris a authenticated"
ON public.usuaris FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. DADES INICIALS
-- ==============================================================================

-- Inserir edició activa 2027
INSERT INTO public.edicions_activitat (nom, any, data_inici, data_fi, activa)
VALUES ('Campus d''Estiu 2027', 2027, '2027-06-23', '2027-07-31', true)
ON CONFLICT DO NOTHING;

-- Inserir configuració inicial oficial
INSERT INTO public.configuracio_campus (clau, valors_json)
VALUES (
    'general',
    '{"preuBaseSetmana":110,"preuDinarDia":8,"preuExcursio":15,"descomptePct":10,"dataLimitModificacio":"2027-06-10","compteBancari":{"banc":"CaixaBank","iban":"ES91 2100 0418 4502 0005 1332","titular":"Club Esportiu C.D. Murense","concepteExemple":"Campus 2027 - DNI Infant"}}'
)
ON CONFLICT (clau) DO NOTHING;

-- Inserir usuari coordinador per defecte
INSERT INTO public.usuaris (nom_complet, email, rol, actiu)
VALUES ('Coordinació C.D. Murense', 'admin@cdmurense.com', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;
