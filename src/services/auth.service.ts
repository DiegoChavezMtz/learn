import { getSupabase } from '@/lib/supabase';
import type { Session } from '@/types/auth';

const toSession = (s: { user: { id: string; email?: string } } | null): Session | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '' } : null;

/** Acceso de un solo usuario con correo y contraseña (la cuenta se crea a mano en Supabase; no hay registro desde la app). */
export const authService = {
  disponible: () => getSupabase() !== null,

  async getSession(): Promise<Session | null> {
    const sb = getSupabase();
    if (!sb) return null;
    return toSession((await sb.auth.getSession()).data.session);
  },

  async getAccessToken(): Promise<string> {
    const sb = getSupabase();
    return sb ? ((await sb.auth.getSession()).data.session?.access_token ?? '') : '';
  },

  async entrar(email: string, password: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no está configurado');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async cerrarSesion(): Promise<void> {
    await getSupabase()?.auth.signOut();
  },

  onChange(cb: (s: Session | null) => void): () => void {
    const sb = getSupabase();
    if (!sb) return () => {};
    const { data } = sb.auth.onAuthStateChange((_e, s) => cb(toSession(s)));
    return () => data.subscription.unsubscribe();
  },
};
