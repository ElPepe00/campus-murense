// frontend/src/types/inscripcio.ts

export type SexeType = 'nen' | 'nena';

export interface DadesNenForm {
  nom: string;
  cognoms: string;
  dataNaixement: string;
  sexe: SexeType;
  colegi: string;
  curs: string;
  dni?: string;
  alergies?: string;
  malalties?: string;
  tallaRoba?: string;
  clubProcedencia?: string;
  fotoUrl?: string;
}

export interface DadesTutorForm {
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
  parentiu: string;
}

export interface ServeisForm {
  setmanes: number[]; // e.g. [1, 2, 3]
  menjador: boolean;
  intoleranciesMenjador?: string;
  matinera: boolean;
  piscina: 'SI' | 'NO' | 'SI_MANIGUETS';
  excursio1: boolean;
  excursio2: boolean;
}

export interface AutoritzacionsForm {
  imatges: boolean;
  sortides: boolean;
  sortirSol: boolean;
}

export interface InscripcioState {
  pasActual: number; // 1 a 5
  nen: DadesNenForm;
  tutor: DadesTutorForm;
  autoritzats: PersonaAutoritzadaForm[];
  serveis: ServeisForm;
  autoritzacions: AutoritzacionsForm;
}
