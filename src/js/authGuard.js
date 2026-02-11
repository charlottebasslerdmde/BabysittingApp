// authGuard.js - Supabase Authentication Guard
import { supabase } from './supabase';

/**
 * Prüft, ob ein Benutzer eingeloggt ist
 * @returns {Promise<{isAuthenticated: boolean, user: object|null}>}
 */
export const checkAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      isAuthenticated: !!session,
      user: session?.user || null,
      session: session
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      session: null
    };
  }
};

/**
 * Route-Guard für Framework7 Routes
 * Leitet nicht-authentifizierte Benutzer zur Login-Seite weiter
 */
export const requireAuth = async ({ resolve, reject, router }) => {
  const { isAuthenticated } = await checkAuth();
  
  if (isAuthenticated) {
    resolve();
  } else {
    router.navigate('/login/');
    reject();
  }
};

/**
 * Logout Funktion
 */
export const logout = async (router) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Zur Login-Seite navigieren
    router.navigate('/login/');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auth State Listener Setup
 * Ruft callback auf wenn sich der Auth-Status ändert
 */
export const setupAuthListener = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  // Return unsubscribe function
  return () => {
    subscription?.unsubscribe();
  };
};
