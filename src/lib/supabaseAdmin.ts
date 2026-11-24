import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/** Cliente de servidor con la llave de servicio (se salta RLS). Solo para /api/export. Nunca llega al navegador. */
export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
