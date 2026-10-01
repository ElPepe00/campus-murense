// frontend/src/utils/campusConfig.ts

export interface SetmanaConfig {
  num: number;
  nom: string;
  dates: string;
}

export interface CampusGroupConfig {
  id: string;
  nom: string;
  subtitol: string;
  edats: string;
  color: string;
  placesMaximes: number;
  ratioMonitor: string;
  preuSetmana: number;
  preuMenjadorSetmana: number;
  preuMatineraSetmana: number;
  descompteGermansPercent: number;
  zonaEntrenament: string;
  tornPiscina: string;
  pilotaRecomanada: string;
}

export interface CampusConfigData {
  tarifes: {
    preu1Setmana: number;
    preu2Setmanes: number;
    preu3Setmanes: number;
    preu4Setmanes: number;
    preuMenjadorSetmana: number;
    preuMatineraSetmana: number;
    descompteSociPercent: number;
    descompteGermansPercent: number;
  };
  banc: {
    titular: string;
    entitat: string;
    iban: string;
    concepte: string;
    dataLimit: string;
    emailJustificants: string;
    horariOficina: string;
  };
  calendari: {
    anyCampus: number;
    dataGeneralInici: string;
    dataGeneralFi: string;
    estatInscripcions: 'OBERTA' | 'PAUSADA' | 'TANCADA';
    avisEstat: string;
    setmanes: SetmanaConfig[];
  };
  logistica: {
    horariGeneral: string;
    horariMatinera: string;
    horariMenjador: string;
    instalacions: string;
  };
  contacte: {
    telefon: string;
    whatsapp: string;
    email: string;
  };
  grups: CampusGroupConfig[];
}

export const DEFAULT_CAMPUS_CONFIG: CampusConfigData = {
  tarifes: {
    preu1Setmana: 110,
    preu2Setmanes: 200,
    preu3Setmanes: 280,
    preu4Setmanes: 360,
    preuMenjadorSetmana: 35,
    preuMatineraSetmana: 15,
    descompteSociPercent: 10,
    descompteGermansPercent: 10,
  },
  banc: {
    titular: 'Club Esportiu C.D. Murense',
    entitat: 'Caixa Colonya / CaixaBank',
    iban: 'ES93 2056 0016 0520 8320 6827',
    concepte: "CAMPUS [NOM_INFANT] 2027",
    dataLimit: '10/06/2027',
    emailJustificants: 'campuscdmurense@gmail.com',
    horariOficina: 'Dilluns i Dimecres 18:30h - 20:00h | Dimarts 19:00h - 20:30h',
  },
  calendari: {
    anyCampus: 2027,
    dataGeneralInici: '2027-06-23',
    dataGeneralFi: '2027-07-31',
    estatInscripcions: 'OBERTA',
    avisEstat: "Període d'inscripcions oficial obert per a nins i nines de 4 a 14 anys.",
    setmanes: [
      { num: 1, nom: 'Setmana 1', dates: '28 Juny - 2 Juliol' },
      { num: 2, nom: 'Setmana 2', dates: '5 Juliol - 9 Juliol' },
      { num: 3, nom: 'Setmana 3', dates: '12 Juliol - 16 Juliol' },
      { num: 4, nom: 'Setmana 4', dates: '19 Juliol - 23 Juliol' },
    ],
  },
  logistica: {
    horariGeneral: '9:00h a 14:00h',
    horariMatinera: '7:45h a 9:00h',
    horariMenjador: '14:00h a 15:30h',
    instalacions: 'Camp Municipal de Futbol de Muro (Mallorca)',
  },
  contacte: {
    telefon: '612 345 678',
    whatsapp: '34612345678',
    email: 'campus@cdmurense.com',
  },
  grups: [
    {
      id: 'grup-a',
      nom: 'Grup A',
      subtitol: 'Iniciació i Psicomotricitat',
      edats: '4 a 7 anys (nascuts 2019–2022)',
      color: '#1d4ed8',
      placesMaximes: 25,
      ratioMonitor: '1 monitor / 8 nins',
      preuSetmana: 40,
      preuMenjadorSetmana: 25,
      preuMatineraSetmana: 10,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp F7 A i Poliesportiu',
      tornPiscina: '11:30h a 12:30h',
      pilotaRecomanada: 'Talla 3',
    },
    {
      id: 'grup-b',
      nom: 'Grup B',
      subtitol: 'Desenvolupament i Tècnica',
      edats: '8 a 10 anys (nascuts 2016–2018)',
      color: '#be185d',
      placesMaximes: 30,
      ratioMonitor: '1 monitor / 12 nins',
      preuSetmana: 40,
      preuMenjadorSetmana: 25,
      preuMatineraSetmana: 10,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp Gespa Principal F7',
      tornPiscina: '12:30h a 13:30h',
      pilotaRecomanada: 'Talla 4',
    },
    {
      id: 'grup-c',
      nom: 'Grup C',
      subtitol: 'Tecnificació i Rendiment',
      edats: '11 a 14 anys (nascuts 2013–2015)',
      color: '#15803d',
      placesMaximes: 30,
      ratioMonitor: '1 monitor / 15 nins',
      preuSetmana: 45,
      preuMenjadorSetmana: 25,
      preuMatineraSetmana: 10,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp F11 Principal',
      tornPiscina: '13:00h a 14:00h',
      pilotaRecomanada: 'Talla 5',
    },
  ],
};

const STORAGE_KEY = 'campus_murense_global_config_v2';
const EVENT_KEY = 'campus_config_updated';

/**
 * Obté la configuració actual des de localStorage o els valors per defecte.
 */
export function getStoredCampusConfig(): CampusConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CAMPUS_CONFIG,
        ...parsed,
        tarifes: { ...DEFAULT_CAMPUS_CONFIG.tarifes, ...(parsed.tarifes || {}) },
        banc: { ...DEFAULT_CAMPUS_CONFIG.banc, ...(parsed.banc || {}) },
        calendari: {
          ...DEFAULT_CAMPUS_CONFIG.calendari,
          ...(parsed.calendari || {}),
          setmanes: parsed.calendari?.setmanes || DEFAULT_CAMPUS_CONFIG.calendari.setmanes,
        },
        logistica: { ...DEFAULT_CAMPUS_CONFIG.logistica, ...(parsed.logistica || {}) },
        contacte: { ...DEFAULT_CAMPUS_CONFIG.contacte, ...(parsed.contacte || {}) },
        grups: parsed.grups && parsed.grups.length > 0 ? parsed.grups : DEFAULT_CAMPUS_CONFIG.grups,
      };
    }
  } catch (e) {
    console.error('Error llegint la configuració de localStorage:', e);
  }
  return DEFAULT_CAMPUS_CONFIG;
}

/**
 * Desa la configuració localment i emet un esdeveniment per sincronitzar tots els components.
 */
export function setStoredCampusConfig(config: CampusConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: config }));
  } catch (e) {
    console.error('Error desant la configuració a localStorage:', e);
  }
}

/**
 * Subscriu-se a canvis en la configuració.
 */
export function onCampusConfigChange(callback: (cfg: CampusConfigData) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<CampusConfigData>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredCampusConfig());
    }
  };
  window.addEventListener(EVENT_KEY, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_KEY, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Retorna el mapa de preus segons el nombre de setmanes triat.
 */
export function getCampusPriceMap(): { [key: number]: number } {
  const cfg = getStoredCampusConfig();
  return {
    1: cfg.tarifes.preu1Setmana,
    2: cfg.tarifes.preu2Setmanes,
    3: cfg.tarifes.preu3Setmanes,
    4: cfg.tarifes.preu4Setmanes,
  };
}

