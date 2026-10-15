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
  // Lògica 2027: Exactament 1 setmana per inscripció (Preu base: 110 €)
  setmana: number; // 1, 2, 3 o 4
  setmanes?: number[]; // Compatibilitat legacy

  // Servei Dinar: selecció de dies individuals (8 €/dia)
  diesDinar: string[]; // ex: ['2027-06-28', '2027-06-29']
  intoleranciesDinar?: string;
  intoleranciesMenjador?: string; // Àlies
  menjador?: boolean; // Compatibilitat legacy

  // Excursions (+15 € cadascuna)
  excursio1: boolean; // Excursió 30/06/2027 (+15 €)
  excursio2: boolean; // Excursió 07/07/2027 (+15 €)

  // Descomptes no acumulables (10% sobre la base de la setmana = 11 €)
  descompte: DescompteType;

  matinera?: boolean;
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

export interface ModificacioInscripcioData {
  modificacioPermesa: boolean;
  dataLimit: string;
  motiuBloqueig?: string;
  inscripcio: {
    id: number;
    editToken: string;
    estatPagament: string;
    preuTotal: number;
    setmana: number;
    diesDinar: string[];
    dinarDiesTotal: number;
    intoleranciesDinar: string;
    excursio1: boolean;
    excursio2: boolean;
    descompte: DescompteType;
    autoritzacions: {
      imatges: boolean;
      sortirSol: boolean;
      sortides: boolean;
      piscina: PiscinaOptionType;
    };
  };
  nen: DadesNenForm & { id: number };
  tutor: DadesTutorForm & { id?: number };
  autoritzats: Array<PersonaAutoritzadaForm & { id?: number }>;
}
