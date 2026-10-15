// frontend/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Configuració del client oficial de Supabase per al Campus C.D. Murense.
 * Les variables s'injecten en temps de compilació mitjançant Vite (import.meta.env).
 * En Vercel cal configurar:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Avís: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no estan definides a les variables d\'entorn. ' +
    'Configura-les al fitxer frontend/.env o al panell de Vercel.'
  );
}

// Fallback segur per evitar excepcions crítiques en build si falten claus
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Noms constants dels Storage Buckets a Supabase:
 * - 'dni-documents': Per còpies de DNI / Targeta Sanitària
 * - 'justificants-pagament': Per comprovants de transferència bancària
 */
export const STORAGE_BUCKETS = {
  DNI: 'dni-documents',
  JUSTIFICANTS: 'justificants-pagament',
} as const;

export default supabase;
