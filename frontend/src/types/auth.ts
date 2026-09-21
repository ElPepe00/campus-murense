// frontend/src/types/auth.ts

export type RolUsuari = 'ADMIN' | 'MONITOR';

export interface Usuari {
  id: number;
  nom_complet: string;
  email: string;
  rol: RolUsuari;
  actiu: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
