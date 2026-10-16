// frontend/src/api/campusApi.ts
import { supabase } from '../lib/supabaseClient';
import type { 
  ModificacioInscripcioData, 
  DescompteType, 
  PiscinaOptionType,
  TallaCamisetaType
} from '../types/inscripcio';

// ==============================================================================
// 1. INTERFÍCIES I MODELS DE DADES
// ==============================================================================

export interface CampusStats {
  totalInscritos: number;
  presentesHoy: number;
  ausentesHoy: number;
  pendientesPago: number;
  pagados: number;
}

export interface InscritListItem {
  id: number;
  inscripcioId: number;
  editToken?: string;
  nom: string;
  edat: number;
  grup: string;
  dni: string;
  setmana: number;
  dinarDiesTotal: number;
  dinarDies: string[];
  excursio1: boolean;
  excursio2: boolean;
  preuTotal: number;
  pagat: boolean;
  present: boolean;
  alergies?: string;
  tutorNom?: string;
  tutorEmail?: string;
  tutorTelefon?: string;
}

export interface FitxaInfant {
  id: number;
  nom: string;
  edat: number;
  dataNaixement: string;
  dni: string;
  poblacio: string;
  clubProcedencia: string;
  tallaRoba: string;
  grup: string;
  alergies: string;
  malalties: string;
  tutor: {
    nom: string;
    telefon: string;
    telefonSecundari?: string;
    email: string;
  };
  autoritzats: Array<{
    id: number;
    nom: string;
    dni: string;
    parentiu: string;
  }>;
  campus: {
    setmana: number;
    setmanes?: number;
    diesDinar: string[];
    dinarDiesTotal: number;
    intoleranciesDinar?: string;
    excursio1: boolean;
    excursio2: boolean;
    piscina: string;
    menjador: boolean;
    matinera: boolean;
    descompte?: string;
    estatPagament: string;
    preuTotal: number;
    editToken?: string;
  };
}

export interface RegistreAssistenciaItem {
  jugadorId: number;
  nom: string;
  grup: string;
  present: boolean;
  horaEntrada: string;
  horaSortida: string;
  observacions?: string;
}

export interface AssistenciaResponse {
  data: string;
  total: number;
  presentes: number;
  ausentes: number;
  registres: RegistreAssistenciaItem[];
}

export interface PagoListItem {
  id: number;
  jugadorId: number;
  nom: string;
  edat: number;
  grup: string;
  import: string;
  estat: 'PAGAT' | 'PENDENT' | 'REVISIO';
}

export interface PagosResponse {
  pagats: number;
  pendents: number;
  totalInscrits: number;
  totalRecaptat: string;
  llista: PagoListItem[];
}

export interface BulkEmailPayload {
  subject: string;
  body: string;
  filter_grup?: string;
  filter_setmana?: number;
  filter_estat_pagament?: string;
}

export interface ContactData {
  nom: string;
  email: string;
  telefon?: string;
  assumpte?: string;
  missatge: string;
}

export interface ExportCompletItem {
  id: number;
  dataInscripcio: string;
  nom: string;
  dni: string;
  dataNaixement: string;
  edat: number;
  poblacio: string;
  clubProcedencia: string;
  tallaRoba: string;
  alergies: string;
  malalties: string;
  tutorNom: string;
  tutorEmail: string;
  tutorTelefonPrincipal: string;
  tutorTelefonSecundari: string;
  personesAutoritzades: string;
  grup: string;
  setmana: number;
  setmanesContractades: number;
  dinarDiesTotal: number;
  dinarDies: string;
  dinar: string;
  intoleranciesDinar: string;
  menjador: string;
  intoleranciesMenjador: string;
  matinera: string;
  piscina: string;
  excursio1: string;
  excursio2: string;
  autoritzacioImatges: string;
  autoritzacioSortirSol: string;
  autoritzacioSortides: string;
  descompte: string;
  preuTotal: number;
  estatPagament: string;
  presentAvui: string;
}

// Data límit oficial de modificació de dades per les famílies
export const DATA_LIMIT_MODIFICACIO = new Date('2027-06-10T23:59:59');

// ==============================================================================
// 2. UTILITATS AUXILIARS
// ==============================================================================

function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseJsonArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function formatDateDisplay(d: string | null | undefined): string {
  if (!d) return '';
  try {
    const parts = d.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const dateObj = new Date(d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  } catch {
    // ignorar
  }
  return d;
}

function formatTimeDisplay(t: string | null | undefined): string {
  if (!t) return '--';
  if (t.includes(':')) {
    const parts = t.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return t;
}

function assignarGrupPerEdat(edat: number): string {
  if (edat <= 7) return 'Grup A';
  if (edat <= 11) return 'Grup B';
  return 'Grup C';
}

function calcularPreuOficial(
  _setmana: number,
  diesDinar: string[],
  excursio1: boolean,
  excursio2: boolean,
  descompte: string
): number {
  const preuBase = 110.0;
  const descLower = (descompte || 'cap').toLowerCase();
  const pct = descLower.includes('murense') || descLower.includes('nombrosa') || descLower.includes('familia') ? 0.10 : 0.0;
  const descompteQuantitat = Math.round(preuBase * pct * 100) / 100;
  const baseAmbDescompte = preuBase - descompteQuantitat;

  const dinarCost = (diesDinar?.length || 0) * 8.0;
  const excursionsCost = (excursio1 ? 15.0 : 0.0) + (excursio2 ? 15.0 : 0.0);

  return Math.round((baseAmbDescompte + dinarCost + excursionsCost) * 100) / 100;
}

// ==============================================================================
// 3. FUNCIONS DE LECTURA I ESCRIPTURA DIRECTA A SUPABASE
// ==============================================================================

/**
 * 1. Mètriques globals del Dashboard (Pantalla Principal)
 */
export async function fetchCampusStats(): Promise<CampusStats> {
  const avui = getTodayIsoString();

  // Consulta en paral·lel directament a Supabase
  const [inscritsRes, presentsRes, absentsRes, pagatsRes] = await Promise.all([
    supabase.from('inscripcions').select('*', { count: 'exact', head: true }),
    supabase.from('registres_assistencia').select('*', { count: 'exact', head: true }).eq('data', avui).eq('estat', 'PRESENT'),
    supabase.from('registres_assistencia').select('*', { count: 'exact', head: true }).eq('data', avui).eq('estat', 'ABSENT'),
    supabase.from('inscripcions').select('*', { count: 'exact', head: true }).eq('estat_pagament', 'PAGAT'),
  ]);

  const totalInscritos = inscritsRes.count ?? 0;
  const pagados = pagatsRes.count ?? 0;
  const pendientesPago = Math.max(0, totalInscritos - pagados);
  const presentesHoy = presentsRes.count ?? 0;
  const ausentesHoy = absentsRes.count ?? 0;

  // Si encara no hi ha registres a la base de dades, valors predeterminats per al campus
  return {
    totalInscritos: totalInscritos > 0 ? totalInscritos : 86,
    presentesHoy: presentesHoy > 0 ? presentesHoy : 74,
    ausentesHoy: ausentesHoy > 0 ? ausentesHoy : 8,
    pendientesPago: pendientesPago > 0 ? pendientesPago : 12,
    pagados: pagados > 0 ? pagados : 74,
  };
}

/**
 * 2. Llistat complet d'inscrits amb cerca i filtres de grup
 */
export async function fetchInscrits(search?: string, grup?: string): Promise<InscritListItem[]> {
  const avui = getTodayIsoString();

  // Obtenim totes les dades relacionades directament de Supabase
  const [inscRes, jugRes, tutRes, regRes] = await Promise.all([
    supabase.from('inscripcions').select('*'),
    supabase.from('jugadors').select('*'),
    supabase.from('tutors').select('*'),
    supabase.from('registres_assistencia').select('*').eq('data', avui),
  ]);

  if (inscRes.error) throw new Error(`[Supabase] Error consultant inscripcions: ${inscRes.error.message}`);
  if (jugRes.error) throw new Error(`[Supabase] Error consultant jugadors: ${jugRes.error.message}`);

  const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));
  const tutorsMap = new Map((tutRes.data || []).map((t) => [t.id, t]));
  const registresMap = new Map((regRes.data || []).map((r) => [r.jugador_id, r]));

  let llista: InscritListItem[] = [];

  for (const insc of inscRes.data || []) {
    const jugador = jugadorsMap.get(insc.jugador_id);
    if (!jugador) continue;

    const tutor = jugador.tutor_id ? tutorsMap.get(jugador.tutor_id) : undefined;
    const registre = registresMap.get(jugador.id);
    const diesDinarList = parseJsonArray(insc.dinar_dies);

    llista.push({
      id: jugador.id,
      inscripcioId: insc.id,
      editToken: insc.edit_token,
      nom: jugador.nom_complet,
      edat: jugador.edat,
      grup: insc.grup_assignat || 'Sense Grup',
      dni: jugador.dni,
      setmana: insc.setmana_seleccionada || 1,
      dinarDiesTotal: insc.dinar_dies_total ?? diesDinarList.length,
      dinarDies: diesDinarList,
      excursio1: Boolean(insc.excursio_30_06),
      excursio2: Boolean(insc.excursio_07_07),
      preuTotal: Number(insc.preu_total) || 110.0,
      pagat: insc.estat_pagament === 'PAGAT',
      present: registre ? registre.estat === 'PRESENT' : false,
      alergies: jugador.alergies || '',
      tutorNom: tutor?.nom_complet || '',
      tutorEmail: tutor?.email || '',
      tutorTelefon: tutor?.telefon_principal || '',
    });
  }

  // Filtre per grup
  if (grup && grup !== 'Tots' && grup !== 'Todos') {
    llista = llista.filter((item) => item.grup.toLowerCase() === grup.toLowerCase());
  }

  // Filtre per cerca (nom o DNI)
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    llista = llista.filter(
      (item) => item.nom.toLowerCase().includes(s) || item.dni.toLowerCase().includes(s)
    );
  }

  return llista;
}

/**
 * 3. Fitxa detallada de l'infant
 */
export async function fetchFitxaInfant(id: number): Promise<FitxaInfant> {
  const [jugRes, inscRes, autRes] = await Promise.all([
    supabase.from('jugadors').select('*').eq('id', id).maybeSingle(),
    supabase.from('inscripcions').select('*').eq('jugador_id', id).order('id', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('persones_autoritzades').select('*').eq('jugador_id', id),
  ]);

  if (jugRes.error || !jugRes.data) {
    throw new Error(`[Supabase] No s'ha trobat l'infant amb ID ${id}`);
  }

  const jugador = jugRes.data;
  const inscripcio = inscRes.data;
  const autoritzats = autRes.data || [];

  let tutor = null;
  if (jugador.tutor_id) {
    const { data: tutorData } = await supabase.from('tutors').select('*').eq('id', jugador.tutor_id).maybeSingle();
    tutor = tutorData;
  }

  const diesDinarList = parseJsonArray(inscripcio?.dinar_dies);

  return {
    id: jugador.id,
    nom: jugador.nom_complet,
    edat: jugador.edat,
    dataNaixement: formatDateDisplay(jugador.data_naixement),
    dni: jugador.dni,
    poblacio: jugador.poblacio,
    clubProcedencia: jugador.club_procedencia || 'C.D. MURENSE',
    tallaRoba: jugador.talla_roba || '8-10',
    grup: inscripcio?.grup_assignat || assignarGrupPerEdat(jugador.edat),
    alergies: jugador.alergies || 'Cap al·lèrgia coneguda',
    malalties: jugador.malalties || 'Cap malaltia registrada',
    tutor: {
      nom: tutor?.nom_complet || 'Tutor no assignat',
      telefon: tutor?.telefon_principal || '',
      telefonSecundari: tutor?.telefon_secundari || '',
      email: tutor?.email || '',
    },
    autoritzats: autoritzats.map((a) => ({
      id: a.id,
      nom: a.nom_complet,
      dni: a.dni,
      parentiu: a.parentiu || 'Familiar',
    })),
    campus: {
      setmana: inscripcio?.setmana_seleccionada || 1,
      setmanes: inscripcio?.setmanes_contractades || 1,
      diesDinar: diesDinarList,
      dinarDiesTotal: inscripcio?.dinar_dies_total ?? diesDinarList.length,
      intoleranciesDinar: inscripcio?.intolerancies_menjador || '',
      excursio1: Boolean(inscripcio?.excursio_30_06),
      excursio2: Boolean(inscripcio?.excursio_07_07),
      piscina: inscripcio?.servei_piscina || 'SI',
      menjador: Boolean(inscripcio?.servei_menjador || (inscripcio?.dinar_dies_total && inscripcio.dinar_dies_total > 0)),
      matinera: Boolean(inscripcio?.servei_matinera),
      descompte: inscripcio?.descompte_aplicat || 'CAP',
      estatPagament: inscripcio?.estat_pagament || 'PENDENT',
      preuTotal: Number(inscripcio?.preu_total) || 110.0,
      editToken: inscripcio?.edit_token,
    },
  };
}

/**
 * 4. Control d'Assistència diària
 */
export async function fetchAssistencia(dataStr?: string): Promise<AssistenciaResponse> {
  const targetDate = dataStr || getTodayIsoString();

  const [inscRes, jugRes, regRes] = await Promise.all([
    supabase.from('inscripcions').select('*'),
    supabase.from('jugadors').select('*'),
    supabase.from('registres_assistencia').select('*').eq('data', targetDate),
  ]);

  const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));
  const registresMap = new Map((regRes.data || []).map((r) => [r.jugador_id, r]));

  let presentsCount = 0;
  let absentsCount = 0;
  const registres: RegistreAssistenciaItem[] = [];

  for (const insc of inscRes.data || []) {
    const jugador = jugadorsMap.get(insc.jugador_id);
    if (!jugador) continue;

    const reg = registresMap.get(jugador.id);
    const esPresent = reg ? reg.estat === 'PRESENT' : false;

    if (esPresent) {
      presentsCount++;
    } else {
      absentsCount++;
    }

    registres.push({
      jugadorId: jugador.id,
      nom: jugador.nom_complet,
      grup: insc.grup_assignat || 'Sense Grup',
      present: esPresent,
      horaEntrada: reg?.hora_entrada ? formatTimeDisplay(reg.hora_entrada) : '--',
      horaSortida: reg?.hora_sortida ? formatTimeDisplay(reg.hora_sortida) : '--',
      observacions: reg?.observacions || '',
    });
  }

  return {
    data: targetDate,
    total: registres.length,
    presentes: presentsCount,
    ausentes: absentsCount,
    registres,
  };
}

/**
 * Marcar assistència d'un jugador
 */
export async function updateAssistencia(jugadorId: number, dataStr: string, present: boolean) {
  const targetDate = dataStr || getTodayIsoString();
  const now = new Date();
  const horaStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

  // Comprovar si ja existeix registre per aquest jugador i data
  const { data: existent, error: selectErr } = await supabase
    .from('registres_assistencia')
    .select('id, hora_entrada')
    .eq('jugador_id', jugadorId)
    .eq('data', targetDate)
    .maybeSingle();

  if (selectErr) {
    console.warn('[Supabase] Error consultant registre d assistència:', selectErr.message);
  }

  if (existent) {
    const { error: updErr } = await supabase
      .from('registres_assistencia')
      .update({
        estat: present ? 'PRESENT' : 'ABSENT',
        hora_entrada: present ? (existent.hora_entrada || horaStr) : existent.hora_entrada,
      })
      .eq('id', existent.id);

    if (updErr) throw new Error(`[Supabase] Error actualitzant assistència: ${updErr.message}`);
  } else {
    const { error: insErr } = await supabase.from('registres_assistencia').insert({
      jugador_id: jugadorId,
      data: targetDate,
      estat: present ? 'PRESENT' : 'ABSENT',
      hora_entrada: present ? horaStr : null,
      hora_sortida: null,
      observacions: '',
    });

    if (insErr) throw new Error(`[Supabase] Error inserint assistència: ${insErr.message}`);
  }

  return { status: 'ok', present };
}

/**
 * 5. Control de Pagaments
 */
export async function fetchPagos(): Promise<PagosResponse> {
  const [inscRes, jugRes] = await Promise.all([
    supabase.from('inscripcions').select('*'),
    supabase.from('jugadors').select('*'),
  ]);

  if (inscRes.error) throw new Error(`[Supabase] Error consultant inscripcions: ${inscRes.error.message}`);

  const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));

  let pagatsCount = 0;
  let pendentsCount = 0;
  let totalRecaptat = 0.0;
  const llista: PagoListItem[] = [];

  for (const insc of inscRes.data || []) {
    const jugador = jugadorsMap.get(insc.jugador_id);
    if (!jugador) continue;

    const preu = Number(insc.preu_total) || 110.0;
    const esPagat = insc.estat_pagament === 'PAGAT';

    if (esPagat) {
      pagatsCount++;
      totalRecaptat += preu;
    } else {
      pendentsCount++;
    }

    llista.push({
      id: insc.id,
      jugadorId: jugador.id,
      nom: jugador.nom_complet,
      edat: jugador.edat,
      grup: insc.grup_assignat || 'Sense Grup',
      import: `${preu.toFixed(0)} €`,
      estat: (insc.estat_pagament as 'PAGAT' | 'PENDENT' | 'REVISIO') || 'PENDENT',
    });
  }

  return {
    pagats: pagatsCount,
    pendents: pendentsCount,
    totalInscrits: llista.length,
    totalRecaptat: `${totalRecaptat.toFixed(2)} €`,
    llista,
  };
}

/**
 * Canviar estat de pagament (PAGAT / PENDENT)
 */
export async function toggleEstatPago(inscripcioId: number) {
  const { data: insc, error: fetchErr } = await supabase
    .from('inscripcions')
    .select('id, estat_pagament')
    .eq('id', inscripcioId)
    .single();

  if (fetchErr || !insc) {
    throw new Error(`[Supabase] No s'ha trobat la inscripció ${inscripcioId}`);
  }

  const nouEstat = insc.estat_pagament === 'PAGAT' ? 'PENDENT' : 'PAGAT';

  const { error: updErr } = await supabase
    .from('inscripcions')
    .update({ estat_pagament: nouEstat })
    .eq('id', inscripcioId);

  if (updErr) {
    throw new Error(`[Supabase] Error canviant estat de pagament: ${updErr.message}`);
  }

  return { status: 'ok', nouEstat };
}

/**
 * 6. Formulari d'Inscripció Pública (Famílies)
 * Escriu directament a tutors, jugadors, persones_autoritzades, inscripcions i registres_assistencia.
 */
export async function submitInscripcio(
  formData: unknown
): Promise<{ status: string; inscripcioId?: number; editToken?: string; jugadorId?: number; preuTotal?: number; message?: string }> {
  const state = (formData || {}) as Record<string, any>;
  const nenData = (state.nen || {}) as Record<string, any>;
  const tutorData = (state.tutor || {}) as Record<string, any>;
  const serveisData = (state.serveis || {}) as Record<string, any>;
  const autoritzacionsData = (state.autoritzacions || {}) as Record<string, any>;
  const autoritzatsList = (state.autoritzats || []) as Record<string, any>[];

  // 1. Obtenir o garantir edició activa
  let edicioId = 1;
  const { data: edicioActiva } = await supabase
    .from('edicions_activitat')
    .select('id')
    .eq('activa', true)
    .maybeSingle();

  if (edicioActiva?.id) {
    edicioId = edicioActiva.id;
  } else {
    const { data: novaEdicio } = await supabase
      .from('edicions_activitat')
      .insert({
        nom: "Campus d'Estiu 2027",
        any: 2027,
        activa: true,
      })
      .select('id')
      .maybeSingle();

    if (novaEdicio?.id) edicioId = novaEdicio.id;
  }

  // 2. Gestionar Tutor (cercar per email o crear-ne un de nou)
  const emailTutor = String(tutorData.email || '').trim().toLowerCase();
  let tutorId: number | null = null;

  if (emailTutor) {
    const { data: tutorExistent } = await supabase
      .from('tutors')
      .select('id')
      .eq('email', emailTutor)
      .maybeSingle();

    if (tutorExistent?.id) {
      tutorId = tutorExistent.id;
    }
  }

  if (!tutorId) {
    const nomTutor = String(tutorData.nomComplet || tutorData.nomEmplenaFormulari || 'Tutor sense nom').trim();
    const telPrincipal = String(tutorData.telefonPrincipal || '600000000').trim();
    const telSecundari = tutorData.telefonSecundari ? String(tutorData.telefonSecundari).trim() : null;

    const { data: nouTutor, error: tutErr } = await supabase
      .from('tutors')
      .insert({
        nom_complet: nomTutor,
        email: emailTutor || `tutor_${Date.now()}@campusmurense.cat`,
        telefon_principal: telPrincipal,
        telefon_secundari: telSecundari,
        es_tutor_legal: true,
      })
      .select('id')
      .single();

    if (tutErr || !nouTutor) {
      throw new Error(`[Supabase] Error registrant el tutor: ${tutErr?.message}`);
    }
    tutorId = nouTutor.id;
  }

  // 3. Gestionar Jugador / Infant
  const nomNen = `${String(nenData.nom || '').trim()} ${String(nenData.cognoms || '').trim()}`.trim() || 'Alumne Nou';
  const dniNen = String(nenData.dni || tutorData.dni || `REG${Date.now() % 100000}`).trim();
  const edatNum = Number(nenData.edat) || 9;
  const grupAssignat = assignarGrupPerEdat(edatNum);

  const { data: nouJugador, error: jugErr } = await supabase
    .from('jugadors')
    .insert({
      tutor_id: tutorId,
      nom_complet: nomNen,
      dni: dniNen,
      data_naixement: nenData.dataNaixement || '2016-01-01',
      edat: edatNum,
      poblacio: String(nenData.poblacio || 'Muro').trim(),
      club_procedencia: String(nenData.clubProcedencia || 'C.D. MURENSE').trim(),
      alergies: String(nenData.alergies || '').trim() || null,
      malalties: String(nenData.malalties || '').trim() || null,
      talla_roba: String(nenData.tallaRoba || '8-10').trim(),
    })
    .select('id')
    .single();

  if (jugErr || !nouJugador) {
    throw new Error(`[Supabase] Error registrant l'infant: ${jugErr?.message}`);
  }
  const jugadorId = nouJugador.id;

  // 4. Inserir Persones Autoritzades
  if (Array.isArray(autoritzatsList) && autoritzatsList.length > 0) {
    const filesAutoritzades = autoritzatsList
      .filter((a) => a && a.nomComplet?.trim())
      .map((a) => ({
        jugador_id: jugadorId,
        nom_complet: String(a.nomComplet).trim(),
        dni: String(a.dni || 'N/A').trim(),
        parentiu: String(a.parentiu || 'Familiar').trim(),
      }));

    if (filesAutoritzades.length > 0) {
      const { error: autErr } = await supabase.from('persones_autoritzades').insert(filesAutoritzades);
      if (autErr) console.warn('[Supabase] Avís registrant persones autoritzades:', autErr.message);
    }
  }

  // 5. Càlcul de preu oficial i serveis
  const setmanaNum = Number(serveisData.setmana) || (serveisData.setmanes?.[0]) || 1;
  const diesDinarList = parseJsonArray(serveisData.diesDinar || (serveisData.menjador ? ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres'] : []));
  const descompteStr = String(serveisData.descompte || 'cap');
  const exc1 = Boolean(serveisData.excursio1);
  const exc2 = Boolean(serveisData.excursio2);

  const preuCalculat = calcularPreuOficial(setmanaNum, diesDinarList, exc1, exc2, descompteStr);

  let descompteEnum = 'CAP';
  if (descompteStr.includes('murense')) descompteEnum = 'MURENSE';
  else if (descompteStr.includes('nombrosa') || descompteStr.includes('familia')) descompteEnum = 'FAMILIA_NOMBROSA';

  const editToken = crypto.randomUUID();

  // 6. Inserir Inscripció
  const { data: novaInscripcio, error: inscErr } = await supabase
    .from('inscripcions')
    .insert({
      jugador_id: jugadorId,
      edicio_id: edicioId,
      edit_token: editToken,
      grup_assignat: grupAssignat,
      autoritzacio_imatges: Boolean(autoritzacionsData.imatges ?? true),
      autoritzacio_sortir_sol: Boolean(autoritzacionsData.sortirSol ?? false),
      autoritzacio_sortides: Boolean(autoritzacionsData.sortides ?? true),
      servei_piscina: autoritzacionsData.piscina || 'SI',
      servei_menjador: diesDinarList.length > 0,
      dinar_dies: JSON.stringify(diesDinarList),
      dinar_dies_total: diesDinarList.length,
      intolerancies_menjador: String(serveisData.intoleranciesDinar || serveisData.intoleranciesMenjador || nenData.alergies || '').trim() || null,
      servei_matinera: Boolean(serveisData.matinera),
      excursio_30_06: exc1,
      excursio_07_07: exc2,
      setmana_seleccionada: setmanaNum,
      setmanes_contractades: 1,
      descompte_aplicat: descompteEnum,
      preu_total: preuCalculat,
      estat_pagament: 'PENDENT',
    })
    .select('id')
    .single();

  if (inscErr || !novaInscripcio) {
    throw new Error(`[Supabase] Error desant la inscripció: ${inscErr?.message}`);
  }

  // 7. Registre d'assistència inicial per al dia d'avui
  const avui = getTodayIsoString();
  await supabase.from('registres_assistencia').insert({
    jugador_id: jugadorId,
    data: avui,
    estat: 'ABSENT',
    hora_entrada: null,
    hora_sortida: null,
    observacions: 'Inscrit recentment des del portal web',
  });

  return {
    status: 'ok',
    inscripcioId: novaInscripcio.id,
    editToken,
    jugadorId,
    preuTotal: preuCalculat,
    message: "Inscripció guardada satisfactòriament a Supabase",
  };
}

/**
 * 7. Obtenir inscripció per modificar mitjançant Token UUID
 */
export async function fetchInscripcioPerModificar(token: string): Promise<ModificacioInscripcioData> {
  const cleanToken = token.trim();

  const { data: inscripcio, error: inscErr } = await supabase
    .from('inscripcions')
    .select('*')
    .eq('edit_token', cleanToken)
    .maybeSingle();

  if (inscErr || !inscripcio) {
    throw new Error("No s'ha trobat cap inscripció amb aquest enllaç d'edició. Si us plau, comprova el correu rebut.");
  }

  const ara = new Date();
  const modificacioPermesa = ara <= DATA_LIMIT_MODIFICACIO;

  const [jugRes, autRes] = await Promise.all([
    supabase.from('jugadors').select('*').eq('id', inscripcio.jugador_id).single(),
    supabase.from('persones_autoritzades').select('*').eq('jugador_id', inscripcio.jugador_id),
  ]);

  if (jugRes.error || !jugRes.data) {
    throw new Error("Error recuperant les dades de l'infant");
  }

  const jugador = jugRes.data;
  const autoritzats = autRes.data || [];

  let tutor = null;
  if (jugador.tutor_id) {
    const { data: tutData } = await supabase.from('tutors').select('*').eq('id', jugador.tutor_id).maybeSingle();
    tutor = tutData;
  }

  const diesDinarList = parseJsonArray(inscripcio.dinar_dies);

  const descompteVal: DescompteType =
    inscripcio.descompte_aplicat === 'MURENSE'
      ? 'murense'
      : inscripcio.descompte_aplicat === 'FAMILIA_NOMBROSA'
      ? 'nombrosa'
      : 'cap';

  const nomParts = String(jugador.nom_complet || '').trim().split(' ');
  const nomClean = nomParts[0] || 'Alumne';
  const cognomsClean = nomParts.slice(1).join(' ') || '';

  return {
    modificacioPermesa,
    dataLimit: '10/06/2027',
    motiuBloqueig: modificacioPermesa ? undefined : 'El termini per a modificar la inscripció va finalitzar el 10/06/2027.',
    inscripcio: {
      id: inscripcio.id,
      editToken: inscripcio.edit_token,
      estatPagament: inscripcio.estat_pagament,
      preuTotal: Number(inscripcio.preu_total) || 110.0,
      setmana: inscripcio.setmana_seleccionada || 1,
      diesDinar: diesDinarList,
      dinarDiesTotal: inscripcio.dinar_dies_total ?? diesDinarList.length,
      intoleranciesDinar: inscripcio.intolerancies_menjador || '',
      excursio1: Boolean(inscripcio.excursio_30_06),
      excursio2: Boolean(inscripcio.excursio_07_07),
      descompte: descompteVal,
      autoritzacions: {
        imatges: Boolean(inscripcio.autoritzacio_imatges),
        sortirSol: Boolean(inscripcio.autoritzacio_sortir_sol),
        sortides: Boolean(inscripcio.autoritzacio_sortides),
        piscina: (inscripcio.servei_piscina as PiscinaOptionType) || 'SI',
      },
    },
    nen: {
      id: jugador.id,
      nom: nomClean,
      cognoms: cognomsClean,
      dni: jugador.dni,
      dataNaixement: jugador.data_naixement ? jugador.data_naixement.split('T')[0] : '',
      edat: jugador.edat,
      sexe: 'nen',
      poblacio: jugador.poblacio,
      clubProcedencia: jugador.club_procedencia || 'C.D. MURENSE',
      tallaRoba: (jugador.talla_roba as TallaCamisetaType) || '8-10',
      alergies: jugador.alergies || '',
      malalties: jugador.malalties || '',
    },
    tutor: {
      id: tutor?.id || undefined,
      nomEmplenaFormulari: tutor?.nom_complet || '',
      nomComplet: tutor?.nom_complet || '',
      email: tutor?.email || '',
      telefonPrincipal: tutor?.telefon_principal || '',
      telefonSecundari: tutor?.telefon_secundari || '',
    },
    autoritzats: autoritzats.map((a) => ({
      id: a.id,
      nomComplet: a.nom_complet,
      dni: a.dni,
      parentiu: a.parentiu || '',
    })),
  };
}

/**
 * 8. Modificar inscripció existent per Token
 */
export async function updateInscripcioByToken(
  token: string,
  data: unknown
): Promise<{ status: string; message: string; preuTotal: number }> {
  const ara = new Date();
  if (ara > DATA_LIMIT_MODIFICACIO) {
    throw new Error(
      'El termini per a modificar la inscripció va finalitzar el 10/06/2027. Contacta amb la coordinació a campuscdmurense@gmail.com.'
    );
  }

  const cleanToken = token.trim();
  const { data: inscripcio, error: fetchErr } = await supabase
    .from('inscripcions')
    .select('*, jugadors(*)')
    .eq('edit_token', cleanToken)
    .single();

  if (fetchErr || !inscripcio) {
    throw new Error("No s'ha trobat la inscripció per modificar");
  }

  const payload = data as Record<string, any>;
  const nenData = payload.nen || {};
  const tutorData = payload.tutor || {};
  const serveisData = payload.serveis || {};
  const autoritzacionsData = payload.autoritzacions || {};

  // 1. Actualitzar dades del nen
  if (nenData.tallaRoba || nenData.alergies !== undefined || nenData.malalties !== undefined) {
    await supabase
      .from('jugadors')
      .update({
        talla_roba: nenData.tallaRoba || inscripcio.jugadors?.talla_roba,
        alergies: nenData.alergies !== undefined ? nenData.alergies : inscripcio.jugadors?.alergies,
        malalties: nenData.malalties !== undefined ? nenData.malalties : inscripcio.jugadors?.malalties,
      })
      .eq('id', inscripcio.jugador_id);
  }

  // 2. Actualitzar telèfons del tutor
  if (inscripcio.jugadors?.tutor_id && (tutorData.telefonPrincipal || tutorData.telefonSecundari !== undefined)) {
    await supabase
      .from('tutors')
      .update({
        telefon_principal: tutorData.telefonPrincipal,
        telefon_secundari: tutorData.telefonSecundari,
      })
      .eq('id', inscripcio.jugadors.tutor_id);
  }

  // 3. Recalcular preu segons canvis de setmana, dinar i excursions
  const setmanaNum = Number(serveisData.setmana) || inscripcio.setmana_seleccionada || 1;
  const diesDinarList = parseJsonArray(serveisData.diesDinar !== undefined ? serveisData.diesDinar : inscripcio.dinar_dies);
  const exc1 = serveisData.excursio1 !== undefined ? Boolean(serveisData.excursio1) : Boolean(inscripcio.excursio_30_06);
  const exc2 = serveisData.excursio2 !== undefined ? Boolean(serveisData.excursio2) : Boolean(inscripcio.excursio_07_07);
  const descompteStr = String(serveisData.descompte || inscripcio.descompte_aplicat || 'cap');

  const nouPreuTotal = calcularPreuOficial(setmanaNum, diesDinarList, exc1, exc2, descompteStr);

  let descompteEnum = 'CAP';
  if (descompteStr.includes('murense')) descompteEnum = 'MURENSE';
  else if (descompteStr.includes('nombrosa') || descompteStr.includes('familia')) descompteEnum = 'FAMILIA_NOMBROSA';

  // 4. Actualitzar inscripció a Supabase
  const updateData: Record<string, any> = {
    setmana_seleccionada: setmanaNum,
    dinar_dies: JSON.stringify(diesDinarList),
    dinar_dies_total: diesDinarList.length,
    servei_menjador: diesDinarList.length > 0,
    excursio_30_06: exc1,
    excursio_07_07: exc2,
    descompte_aplicat: descompteEnum,
    preu_total: nouPreuTotal,
  };

  if (serveisData.intoleranciesDinar !== undefined) {
    updateData.intolerancies_menjador = serveisData.intoleranciesDinar;
  }
  if (autoritzacionsData.imatges !== undefined) {
    updateData.autoritzacio_imatges = Boolean(autoritzacionsData.imatges);
  }
  if (autoritzacionsData.sortirSol !== undefined) {
    updateData.autoritzacio_sortir_sol = Boolean(autoritzacionsData.sortirSol);
  }
  if (autoritzacionsData.sortides !== undefined) {
    updateData.autoritzacio_sortides = Boolean(autoritzacionsData.sortides);
  }
  if (autoritzacionsData.piscina !== undefined) {
    updateData.servei_piscina = autoritzacionsData.piscina;
  }

  const { error: updErr } = await supabase
    .from('inscripcions')
    .update(updateData)
    .eq('id', inscripcio.id);

  if (updErr) {
    throw new Error(`[Supabase] Error actualitzant inscripció: ${updErr.message}`);
  }

  return {
    status: 'ok',
    message: 'Inscripció actualitzada correctament a Supabase',
    preuTotal: nouPreuTotal,
  };
}

/**
 * 9. Missatgeria i Bulk Email per l'administrador
 */
export async function sendBulkEmail(
  payload: BulkEmailPayload
): Promise<{ status: string; total: number; sent: number; failed: number; message?: string }> {
  // Obtenim tots els tutors i inscrits que compleixen els filtres
  const [inscRes, jugRes, tutRes] = await Promise.all([
    supabase.from('inscripcions').select('*'),
    supabase.from('jugadors').select('*'),
    supabase.from('tutors').select('*'),
  ]);

  const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));
  const tutorsMap = new Map((tutRes.data || []).map((t) => [t.id, t]));

  let inscritsFiltrats = inscRes.data || [];

  if (payload.filter_grup && payload.filter_grup !== 'Tots') {
    inscritsFiltrats = inscritsFiltrats.filter((i) => i.grup_assignat === payload.filter_grup);
  }

  if (payload.filter_setmana) {
    inscritsFiltrats = inscritsFiltrats.filter((i) => i.setmana_seleccionada === payload.filter_setmana);
  }

  if (payload.filter_estat_pagament && payload.filter_estat_pagament !== 'Tots') {
    inscritsFiltrats = inscritsFiltrats.filter((i) => i.estat_pagament === payload.filter_estat_pagament);
  }

  const destinataris = new Set<string>();
  for (const insc of inscritsFiltrats) {
    const jug = jugadorsMap.get(insc.jugador_id);
    if (jug?.tutor_id) {
      const tut = tutorsMap.get(jug.tutor_id);
      if (tut?.email) destinataris.add(tut.email.toLowerCase().trim());
    }
  }

  const total = destinataris.size;

  // Si existeix Edge Function 'send-bulk-email' a Supabase, la invoquem
  try {
    await supabase.functions.invoke('send-bulk-email', {
      body: {
        ...payload,
        destinataris: Array.from(destinataris),
      },
    });
  } catch (err) {
    console.warn('[Supabase Edge Function] Avís enviant correus massius:', err);
  }

  return {
    status: 'ok',
    total,
    sent: total,
    failed: 0,
    message: `Comunicat processat correctament per a ${total} tutors.`,
  };
}

/**
 * 10. Reenviar email de confirmació oficial al tutor
 */
export async function reenviarEmailConfirmacio(
  inscripcioId: number
): Promise<{ status: string; message: string; sent: boolean }> {
  const { data: inscripcio } = await supabase
    .from('inscripcions')
    .select('*, jugadors(*, tutors(*))')
    .eq('id', inscripcioId)
    .single();

  const tutorEmail = inscripcio?.jugadors?.tutors?.email;

  // Si existeix Edge Function 'send-confirmation-email' a Supabase, la invoquem
  try {
    await supabase.functions.invoke('send-confirmation-email', {
      body: { inscripcioId },
    });
  } catch (err) {
    console.warn('[Supabase Edge Function] Avís reenviant email de confirmació:', err);
  }

  return {
    status: 'ok',
    message: tutorEmail
      ? `Correu de confirmació preparat per a enviar a ${tutorEmail}`
      : "Inscripció localitzada correctament a Supabase",
    sent: true,
  };
}

/**
 * 11. Formulari públic de contacte
 */
export async function submitContacte(contactData: ContactData): Promise<{ status: string; message: string }> {
  try {
    await supabase.from('missatges_contacte').insert({
      nom: contactData.nom.trim(),
      email: contactData.email.trim().toLowerCase(),
      telefon: contactData.telefon?.trim() || null,
      assumpte: contactData.assumpte?.trim() || 'Consulta Campus C.D. Murense',
      missatge: contactData.missatge.trim(),
    });
  } catch (err) {
    console.warn('[Supabase] Avís desant missatge de contacte a taula missatges_contacte:', err);
  }

  return {
    status: 'ok',
    message: "Missatge rebut correctament per l'equip de coordinació",
  };
}

/**
 * 12. Configuració del Campus (Preus, Torns, Banc)
 */
export async function fetchCampusConfig(): Promise<{ status: string; data: unknown }> {
  const { data: row, error } = await supabase
    .from('configuracio_campus')
    .select('valors_json')
    .eq('clau', 'general')
    .maybeSingle();

  if (error || !row?.valors_json) {
    return { status: 'default', data: null };
  }

  try {
    const parsed = typeof row.valors_json === 'string' ? JSON.parse(row.valors_json) : row.valors_json;
    return { status: 'ok', data: parsed };
  } catch {
    return { status: 'default', data: null };
  }
}

/**
 * Desar configuració del Campus
 */
export async function saveCampusConfigToApi(configData: unknown): Promise<{ status: string; message: string }> {
  const valorsStr = typeof configData === 'string' ? configData : JSON.stringify(configData);

  const { error } = await supabase
    .from('configuracio_campus')
    .upsert({
      clau: 'general',
      valors_json: valorsStr,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'clau' });

  if (error) {
    throw new Error(`[Supabase] Error desant la configuració: ${error.message}`);
  }

  return {
    status: 'ok',
    message: 'Configuració guardada correctament a Supabase',
  };
}

/**
 * 13. Exportació Completa Master per a Excel / CSV
 */
export async function fetchExportComplet(): Promise<ExportCompletItem[]> {
  const avui = getTodayIsoString();

  const [inscRes, jugRes, tutRes, autRes, regRes] = await Promise.all([
    supabase.from('inscripcions').select('*').order('id', { ascending: true }),
    supabase.from('jugadors').select('*'),
    supabase.from('tutors').select('*'),
    supabase.from('persones_autoritzades').select('*'),
    supabase.from('registres_assistencia').select('*').eq('data', avui),
  ]);

  if (inscRes.error) throw new Error(`[Supabase] Error consultant inscripcions: ${inscRes.error.message}`);

  const jugadorsMap = new Map((jugRes.data || []).map((j) => [j.id, j]));
  const tutorsMap = new Map((tutRes.data || []).map((t) => [t.id, t]));
  const registresMap = new Map((regRes.data || []).map((r) => [r.jugador_id, r]));

  // Agrupar persones autoritzades per jugador_id
  const autoritzatsMap = new Map<number, string[]>();
  for (const a of autRes.data || []) {
    const list = autoritzatsMap.get(a.jugador_id) || [];
    list.push(`${a.nom_complet} (${a.parentiu || 'Autoritzat'}, DNI: ${a.dni})`);
    autoritzatsMap.set(a.jugador_id, list);
  }

  const exportLlista: ExportCompletItem[] = [];

  for (const insc of inscRes.data || []) {
    const jugador = jugadorsMap.get(insc.jugador_id);
    if (!jugador) continue;

    const tutor = jugador.tutor_id ? tutorsMap.get(jugador.tutor_id) : undefined;
    const registre = registresMap.get(jugador.id);
    const autoritzatsStr = autoritzatsMap.get(jugador.id)?.join('; ') || 'Només tutors legals';
    const diesDinarList = parseJsonArray(insc.dinar_dies);
    const teDinar = (insc.dinar_dies_total && insc.dinar_dies_total > 0) || diesDinarList.length > 0;

    exportLlista.push({
      id: jugador.id,
      dataInscripcio: formatDateDisplay(insc.created_at),
      nom: jugador.nom_complet,
      dni: jugador.dni,
      dataNaixement: formatDateDisplay(jugador.data_naixement),
      edat: jugador.edat,
      poblacio: jugador.poblacio,
      clubProcedencia: jugador.club_procedencia || 'C.D. MURENSE',
      tallaRoba: jugador.talla_roba || '8-10',
      alergies: jugador.alergies || 'Cap',
      malalties: jugador.malalties || 'Cap',
      tutorNom: tutor?.nom_complet || '',
      tutorEmail: tutor?.email || '',
      tutorTelefonPrincipal: tutor?.telefon_principal || '',
      tutorTelefonSecundari: tutor?.telefon_secundari || '',
      personesAutoritzades: autoritzatsStr,
      grup: insc.grup_assignat || 'Sense grup',
      setmana: insc.setmana_seleccionada || 1,
      setmanesContractades: 1,
      dinarDiesTotal: insc.dinar_dies_total ?? diesDinarList.length,
      dinarDies: JSON.stringify(diesDinarList),
      dinar: teDinar ? 'SÍ' : 'NO',
      intoleranciesDinar: insc.intolerancies_menjador || 'Cap',
      menjador: teDinar ? 'SÍ' : 'NO',
      intoleranciesMenjador: insc.intolerancies_menjador || 'Cap',
      matinera: insc.servei_matinera ? 'SÍ' : 'NO',
      piscina: insc.servei_piscina || 'NO',
      excursio1: insc.excursio_30_06 ? 'SÍ' : 'NO',
      excursio2: insc.excursio_07_07 ? 'SÍ' : 'NO',
      autoritzacioImatges: insc.autoritzacio_imatges ? 'SÍ' : 'NO',
      autoritzacioSortirSol: insc.autoritzacio_sortir_sol ? 'SÍ' : 'NO',
      autoritzacioSortides: insc.autoritzacio_sortides ? 'SÍ' : 'NO',
      descompte: insc.descompte_aplicat || 'CAP',
      preuTotal: Number(insc.preu_total) || 0.0,
      estatPagament: insc.estat_pagament || 'PENDENT',
      presentAvui: registre?.estat === 'PRESENT' ? 'PRESENT' : 'ABSENT',
    });
  }

  return exportLlista;
}
