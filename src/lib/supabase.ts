import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let client: SupabaseClient | null | undefined;

/** Cliente del navegador. Es null si Supabase no está configurado: la app sigue funcionando solo en el dispositivo. */
export function getSupabase(): SupabaseClient | null {
  if (client === undefined) {
    client = env.SUPABASE_URL && env.SUPABASE_ANON_KEY
      ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
      : null;
  }
  return client;
}
