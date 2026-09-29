// frontend/src/types/inscripcio.ts

export type SexeType = 'nen' | 'nena';

export type TallaCamisetaType = '4-6' | '8-10' | '12' | '14' | 'S' | 'M';

export type PiscinaOptionType = 'SI' | 'NO' | 'SI_MANIGUETS';

export type DescompteType = 'cap' | 'murense' | 'nombrosa';

export interface DadesNenForm {
  nom: string;
  cognoms: string;
  dni: string;
  edat: number | string;
  dataNaixement: string;
  sexe: SexeType;
  poblacio: string;
  clubProcedencia: string;
  alergies?: string;
  malalties?: string;
  colegi: string;
  curs: string;
  tallaRoba: TallaCamisetaType;
  fotoUrl?: string;
}

export interface DadesTutorForm {
  nomEmplenaFormulari: string;
  nomComplet: string;
  email: string;
  telefonPrincipal: string;
  telefonSecundari?: string;
  parentiu?: string;
  dni?: string;
}

export interface PersonaAutoritzadaForm {
  nomComplet: string;
  dni: string;
  parentiu?: string;
}

export interface ServeisForm {
  setmanes: number[]; // [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]
  menjador: boolean;  // 14:00h - 15:00h
  intoleranciesMenjador?: string;
  matinera: boolean;
  descompte: DescompteType;
  excursio1: boolean; // Excursió 30/06/2027
  excursio2: boolean; // Excursió 07/07/2027
}

export interface AutoritzacionsForm {
  imatges: boolean;
  sortirSol: boolean;
  sortides: boolean;
  piscina: PiscinaOptionType;
}

export interface InscripcioState {
  pasActual: number; // 1 a 5
  nen: DadesNenForm;
  tutor: DadesTutorForm;
  autoritzats: PersonaAutoritzadaForm[];
  serveis: ServeisForm;
  autoritzacions: AutoritzacionsForm;
}
