// frontend/src/api/campusApi.ts
import { apiClient } from './client';

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
  nom: string;
  edat: number;
  grup: string;
  dni: string;
  pagat: boolean;
  present: boolean;
  alergies?: string;
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
  colegi: string;
  curs: string;
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
    setmanes: number;
    piscina: string;
    menjador: boolean;
    matinera: boolean;
    estatPagament: string;
    preuTotal: number;
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

export async function fetchCampusStats(): Promise<CampusStats> {
  return apiClient<CampusStats>('/api/campus/stats');
}

export async function fetchInscrits(search?: string, grup?: string): Promise<InscritListItem[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (grup) params.append('grup', grup);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<InscritListItem[]>(`/api/campus/inscrits${query}`);
}

export async function fetchFitxaInfant(id: number): Promise<FitxaInfant> {
  return apiClient<FitxaInfant>(`/api/campus/inscrits/${id}`);
}

export async function fetchAssistencia(dataStr?: string): Promise<AssistenciaResponse> {
  const query = dataStr ? `?data_str=${encodeURIComponent(dataStr)}` : '';
  return apiClient<AssistenciaResponse>(`/api/campus/assistencia${query}`);
}

export async function updateAssistencia(jugadorId: number, dataStr: string, present: boolean) {
  return apiClient('/api/campus/assistencia/marcar', {
    method: 'POST',
    body: JSON.stringify({ jugadorId, data: dataStr, present }),
  });
}

export async function fetchPagos(): Promise<PagosResponse> {
  return apiClient<PagosResponse>('/api/campus/pagos');
}

export async function toggleEstatPago(inscripcioId: number) {
  return apiClient(`/api/campus/pagos/${inscripcioId}/canviar`, {
    method: 'PATCH',
  });
}
