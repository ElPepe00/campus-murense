// frontend/src/api/campusApi.ts
import { apiClient } from './client';
import type { ModificacioInscripcioData } from '../types/inscripcio';

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

export async function submitInscripcio(formData: unknown): Promise<{ status: string; inscripcioId?: number; editToken?: string; jugadorId?: number; preuTotal?: number }> {
  return apiClient<{ status: string; inscripcioId?: number; editToken?: string; jugadorId?: number; preuTotal?: number }>('/api/campus/inscripcions', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export async function fetchInscripcioPerModificar(token: string): Promise<ModificacioInscripcioData> {
  return apiClient<ModificacioInscripcioData>(`/api/campus/inscripcions/modificar/${encodeURIComponent(token)}`);
}

export async function updateInscripcioByToken(token: string, data: unknown): Promise<{ status: string; message: string; preuTotal: number }> {
  return apiClient<{ status: string; message: string; preuTotal: number }>(`/api/campus/inscripcions/${encodeURIComponent(token)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface BulkEmailPayload {
  subject: string;
  body: string;
  filter_grup?: string;
  filter_setmana?: number;
  filter_estat_pagament?: string;
}

export async function sendBulkEmail(payload: BulkEmailPayload): Promise<{ status: string; total: number; sent: number; failed: number; message?: string }> {
  return apiClient<{ status: string; total: number; sent: number; failed: number; message?: string }>('/api/campus/admin/emails/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reenviarEmailConfirmacio(inscripcioId: number): Promise<{ status: string; message: string; sent: boolean }> {
  return apiClient<{ status: string; message: string; sent: boolean }>(`/api/campus/admin/inscripcions/${inscripcioId}/reenviar-email`, {
    method: 'POST',
  });
}

export interface ContactData {
  nom: string;
  email: string;
  telefon?: string;
  assumpte?: string;
  missatge: string;
}

export async function submitContacte(contactData: ContactData): Promise<{ status: string; message: string }> {
  return apiClient<{ status: string; message: string }>('/api/campus/contacte', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
}

export async function fetchCampusConfig(): Promise<{ status: string; data: unknown }> {
  return apiClient<{ status: string; data: unknown }>('/api/campus/config');
}

export async function saveCampusConfigToApi(configData: unknown): Promise<{ status: string; message: string }> {
  return apiClient<{ status: string; message: string }>('/api/campus/config', {
    method: 'PUT',
    body: JSON.stringify(configData),
  });
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

export async function fetchExportComplet(): Promise<ExportCompletItem[]> {
  return apiClient<ExportCompletItem[]>('/api/campus/export/complet');
}
