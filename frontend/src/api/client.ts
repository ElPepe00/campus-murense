// frontend/src/api/client.ts
import { supabase } from '../lib/supabaseClient';

/**
 * Re-export oficial del client de Supabase per al Campus C.D. Murense.
 * Tota la lògica d'accés a dades ara llegeix i escriu directament a Supabase
 * sense passar pel backend de Python (FastAPI).
 */
export { supabase };

/**
 * URL base de Supabase (o de l'entorn) mantinguda per compatibilitat.
 */
const rawApiUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  '';

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

/**
 * Funció de diagnòstic per verificar la connectivitat directa amb Supabase.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('edicions_activitat')
      .select('id')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Funció d'ajuda compatible per si algun component legacy invoca apiClient directament.
 * Sempre recomanable fer servir les funcions específiques de campusApi i authApi.
 */
export async function apiClient<T>(_endpoint: string, _options: RequestInit = {}): Promise<T> {
  throw new Error(
    "L'accés mitjançant apiClient (FastAPI) ha estat suprimit. S'ha d'accedir directament a Supabase mitjançant @supabase/supabase-js."
  );
}
