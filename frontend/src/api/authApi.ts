// frontend/src/api/authApi.ts
import { supabase } from '../lib/supabaseClient';
import type { LoginResponse, Usuari, RolUsuari } from '../types/auth';

/**
 * Inicia sessió per al personal del Campus (Directiva, Coordinadors, Monitors)
 * directament contra Supabase Auth sense passar per Python.
 */
export async function loginStaff(username: string, password: string): Promise<LoginResponse> {
  const email = username.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMsg = 'Error en iniciar sessió';
    if (error.message.includes('Invalid login credentials')) {
      errorMsg = 'Correu electrònic o contrasenya incorrectes';
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg = 'El compte de correu electrònic encara no ha estat confirmat';
    } else if (error.message) {
      errorMsg = error.message;
    }
    throw new Error(errorMsg);
  }

  if (!data.session) {
    throw new Error("No s'ha pogut iniciar sessió a Supabase");
  }

  // Guardem el token per persistència i sincronització de sessió
  localStorage.setItem('murense_token', data.session.access_token);

  return {
    access_token: data.session.access_token,
    token_type: 'bearer',
  };
}

/**
 * Obté el perfil de l'usuari autenticat actual des de Supabase.
 * Consulta la taula 'usuaris' a partir de l'email de la sessió de Supabase Auth.
 */
export async function getPerfilStaff(): Promise<Usuari> {
  // 1. Obtenir sessió / usuari autenticat a Supabase
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  let currentUser = user;

  if (userError || !currentUser) {
    const { data: sessionData } = await supabase.auth.getSession();
    currentUser = sessionData.session?.user || null;
  }

  if (!currentUser?.email) {
    throw new Error('Sessió no vàlida o caducada. Torna a iniciar sessió.');
  }

  const emailClean = currentUser.email.toLowerCase().trim();

  // 2. Cercar dades detallades a la taula 'usuaris'
  const { data: usuariDb, error: dbError } = await supabase
    .from('usuaris')
    .select('id, nom_complet, email, rol, actiu')
    .eq('email', emailClean)
    .maybeSingle();

  if (dbError) {
    console.warn('[Supabase] Avís consultant taula usuaris:', dbError.message);
  }

  if (usuariDb) {
    if (!usuariDb.actiu) {
      throw new Error('Usuari desactivat. Contacta amb la directiva del club.');
    }

    return {
      id: usuariDb.id,
      nom_complet: usuariDb.nom_complet,
      email: usuariDb.email,
      rol: (usuariDb.rol as RolUsuari) || 'ADMIN',
      actiu: usuariDb.actiu,
    };
  }

  // 3. Fallback: Si l'usuari està registrat a Supabase Auth però encara no a la taula 'usuaris'
  const metadata = currentUser.user_metadata || {};
  const rolFromMeta = (metadata.rol as RolUsuari) || 'ADMIN';
  const nomFromMeta = metadata.nom_complet || metadata.full_name || emailClean.split('@')[0];

  return {
    id: 1,
    nom_complet: nomFromMeta,
    email: emailClean,
    rol: rolFromMeta,
    actiu: true,
  };
}

/**
 * Tanca la sessió de l'usuari a Supabase i neteja el magatzem local.
 */
export async function logoutStaff(): Promise<void> {
  localStorage.removeItem('murense_token');
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase] Error durant logout:', err);
  }
}
