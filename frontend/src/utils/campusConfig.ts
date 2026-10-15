// frontend/src/utils/campusConfig.ts
import type { DescompteType } from '../types/inscripcio';

export interface SetmanaDiaInfo {
  data: string;        // '2027-06-28'
  diaSetmana: string;  // 'Dilluns'
  etiqueta: string;    // 'Dl 28/06'
  esExcursio?: boolean;
}

export interface SetmanaConfig {
  num: number;
  nom: string;
  dates: string;
  dies: SetmanaDiaInfo[];
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
    preuDinarDia: number;
    preuExcursio: number;
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

export const CAMPUS_SETMANES_DEF: SetmanaConfig[] = [
  {
    num: 1,
    nom: 'Setmana 1',
    dates: '28 Juny - 2 Juliol 2027',
    dies: [
      { data: '2027-06-28', diaSetmana: 'Dilluns', etiqueta: 'Dl 28/06' },
      { data: '2027-06-29', diaSetmana: 'Dimarts', etiqueta: 'Dm 29/06' },
      { data: '2027-06-30', diaSetmana: 'Dimecres', etiqueta: 'Dx 30/06', esExcursio: true },
      { data: '2027-07-01', diaSetmana: 'Dijous', etiqueta: 'Dj 01/07' },
      { data: '2027-07-02', diaSetmana: 'Divendres', etiqueta: 'Dv 02/07' },
    ],
  },
  {
    num: 2,
    nom: 'Setmana 2',
    dates: '5 Juliol - 9 Juliol 2027',
    dies: [
      { data: '2027-07-05', diaSetmana: 'Dilluns', etiqueta: 'Dl 05/07' },
      { data: '2027-07-06', diaSetmana: 'Dimarts', etiqueta: 'Dm 06/07' },
      { data: '2027-07-07', diaSetmana: 'Dimecres', etiqueta: 'Dx 07/07', esExcursio: true },
      { data: '2027-07-08', diaSetmana: 'Dijous', etiqueta: 'Dj 08/07' },
      { data: '2027-07-09', diaSetmana: 'Divendres', etiqueta: 'Dv 09/07' },
    ],
  },
  {
    num: 3,
    nom: 'Setmana 3',
    dates: '12 Juliol - 16 Juliol 2027',
    dies: [
      { data: '2027-07-12', diaSetmana: 'Dilluns', etiqueta: 'Dl 12/07' },
      { data: '2027-07-13', diaSetmana: 'Dimarts', etiqueta: 'Dm 13/07' },
      { data: '2027-07-14', diaSetmana: 'Dimecres', etiqueta: 'Dx 14/07' },
      { data: '2027-07-15', diaSetmana: 'Dijous', etiqueta: 'Dj 15/07' },
      { data: '2027-07-16', diaSetmana: 'Divendres', etiqueta: 'Dv 16/07' },
    ],
  },
  {
    num: 4,
    nom: 'Setmana 4',
    dates: '19 Juliol - 23 Juliol 2027',
    dies: [
      { data: '2027-07-19', diaSetmana: 'Dilluns', etiqueta: 'Dl 19/07' },
      { data: '2027-07-20', diaSetmana: 'Dimarts', etiqueta: 'Dm 20/07' },
      { data: '2027-07-21', diaSetmana: 'Dimecres', etiqueta: 'Dx 21/07' },
      { data: '2027-07-22', diaSetmana: 'Dijous', etiqueta: 'Dj 22/07' },
      { data: '2027-07-23', diaSetmana: 'Divendres', etiqueta: 'Dv 23/07' },
    ],
  },
];

export const DEFAULT_CAMPUS_CONFIG: CampusConfigData = {
  tarifes: {
    preu1Setmana: 110,
    preu2Setmanes: 200,
    preu3Setmanes: 280,
    preu4Setmanes: 360,
    preuMenjadorSetmana: 40,
    preuMatineraSetmana: 15,
    descompteSociPercent: 10,
    descompteGermansPercent: 10,
    preuDinarDia: 8,
    preuExcursio: 15,
  },
  banc: {
    titular: 'Club Esportiu C.D. Murense',
    entitat: 'Caixa Colonya / CaixaBank',
    iban: 'ES93 2056 0016 0520 8320 6827',
    concepte: "CAMPUS [DNI_INFANT] [NOM_INFANT]",
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
    setmanes: CAMPUS_SETMANES_DEF,
  },
  logistica: {
    horariGeneral: '9:00h a 14:00h',
    horariMatinera: '8:00h a 9:00h',
    horariMenjador: '14:00h a 15:00h',
    instalacions: 'Camp Municipal de Futbol de Muro (Mallorca)',
  },
  contacte: {
    telefon: '612 345 678',
    whatsapp: '34612345678',
    email: 'campuscdmurense@gmail.com',
  },
  grups: [
    {
      id: 'grup-a',
      nom: 'Grup A',
      subtitol: 'Iniciació i Psicomotricitat',
      edats: '4 a 7 anys (nascuts 2020–2023)',
      color: '#1d4ed8',
      placesMaximes: 25,
      ratioMonitor: '1 monitor / 8 nins',
      preuSetmana: 110,
      preuMenjadorSetmana: 40,
      preuMatineraSetmana: 15,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp F7 A i Poliesportiu',
      tornPiscina: '11:30h a 12:30h',
      pilotaRecomanada: 'Talla 3',
    },
    {
      id: 'grup-b',
      nom: 'Grup B',
      subtitol: 'Desenvolupament i Tècnica',
      edats: '8 a 11 anys (nascuts 2016–2019)',
      color: '#be185d',
      placesMaximes: 30,
      ratioMonitor: '1 monitor / 12 nins',
      preuSetmana: 110,
      preuMenjadorSetmana: 40,
      preuMatineraSetmana: 15,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp Gespa Principal F7',
      tornPiscina: '12:30h a 13:30h',
      pilotaRecomanada: 'Talla 4',
    },
    {
      id: 'grup-c',
      nom: 'Grup C',
      subtitol: 'Tecnificació i Rendiment',
      edats: '12 a 14 anys (nascuts 2013–2015)',
      color: '#15803d',
      placesMaximes: 30,
      ratioMonitor: '1 monitor / 15 nins',
      preuSetmana: 110,
      preuMenjadorSetmana: 40,
      preuMatineraSetmana: 15,
      descompteGermansPercent: 10,
      zonaEntrenament: 'Camp F11 Principal',
      tornPiscina: '13:00h a 14:00h',
      pilotaRecomanada: 'Talla 5',
    },
  ],
};

const STORAGE_KEY = 'campus_murense_global_config_v3';
const EVENT_KEY = 'campus_config_updated';

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
          setmanes: CAMPUS_SETMANES_DEF,
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

export function setStoredCampusConfig(config: CampusConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: config }));
  } catch (e) {
    console.error('Error desant la configuració a localStorage:', e);
  }
}

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

export function getCampusPriceMap(): { [key: number]: number } {
  return { 1: 110, 2: 200, 3: 280, 4: 360 };
}

/**
 * Càlcul unificat i oficial del preu de la inscripció:
 * Preu Total = (Preu Base Semana - Descuento Si Aplica) + (Días de Dinar * 8 €) + (Excursiones Seleccionadas * 15 €)
 */
export function calculateRegistrationPrice(
  _setmana: number,
  diesDinar: string[] = [],
  excursio1: boolean = false,
  excursio2: boolean = false,
  descompte: DescompteType = 'cap'
) {
  const basePrice = 110;
  const discountRate = (descompte === 'murense' || descompte === 'nombrosa') ? 0.10 : 0.0;
  const discountAmount = Math.round(basePrice * discountRate);
  const baseAfterDiscount = basePrice - discountAmount;

  const dinarCost = diesDinar.length * 8;
  const excursionsCost = (excursio1 ? 15 : 0) + (excursio2 ? 15 : 0);

  const totalPrice = baseAfterDiscount + dinarCost + excursionsCost;

  return {
    basePrice,
    discountRate,
    discountAmount,
    baseAfterDiscount,
    numDiesDinar: diesDinar.length,
    dinarCost,
    excursionsCost,
    totalPrice,
  };
}
