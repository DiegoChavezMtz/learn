import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rowToRegistro, type RegistroRow } from '@/utils/syncMap';

/** Lectura del progreso y del registro C3 para el asesor (`GET /api/export`). */
export const exportService = {
  autorizado(authorization: string | null): boolean {
    if (!env.EXPORT_TOKEN) return false;
    const dado = Buffer.from((authorization ?? '').replace(/^Bearer\s+/i, ''));
    const real = Buffer.from(env.EXPORT_TOKEN);
    return dado.length === real.length && timingSafeEqual(dado, real);
  },

  configurado: () => !!env.EXPORT_TOKEN && getSupabaseAdmin() !== null,

  async leer(tema?: string | null) {
    const sb = getSupabaseAdmin();
    if (!sb) throw new Error('Supabase no está configurado en el servidor');
    let qe = sb.from('estado').select('tema,datos,actualizado');
    let qr = sb.from('registro').select('*').order('inicio');
    if (tema) { qe = qe.eq('tema', tema); qr = qr.eq('tema', tema); }
    const [e, r] = await Promise.all([qe, qr]);
    if (e.error) throw e.error;
    if (r.error) throw r.error;
    return {
      generado: new Date().toISOString(),
      estado: Object.fromEntries((e.data ?? []).map((x) => [x.tema, x.datos])),
      registro: ((r.data ?? []) as RegistroRow[]).map(rowToRegistro),
    };
  },
};
