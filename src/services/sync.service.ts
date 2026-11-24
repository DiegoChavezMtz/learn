import { progressStore, vacio } from '@/lib/progressStore';
import { getSupabase } from '@/lib/supabase';
import type { Progreso } from '@/types/progreso';
import { mergeProgreso, mismoProgreso } from '@/utils/mergeProgreso';
import { registroToRow, rowToRegistro, type RegistroRow } from '@/utils/syncMap';

export type ResultadoSync = 'ok' | 'sin-config' | 'sin-sesion';

/**
 * Sincroniza el almacén local con Supabase, tema por tema: trae lo de la nube, lo une con lo del dispositivo (sin perder
 * nada de ninguno), sube lo que falte y envía los registros C3 pendientes. Si falla (sin red), lo pendiente se queda en el dispositivo.
 */
export const syncService = {
  async sincronizar(): Promise<ResultadoSync> {
    const sb = getSupabase();
    if (!sb) return 'sin-config';
    if (!(await sb.auth.getSession()).data.session) return 'sin-sesion';
    if (!progressStore.getSnapshot()) return 'ok';

    // 1) Progreso de cada tema (los del dispositivo y los de la nube)
    const { data, error } = await sb.from('estado').select('tema,datos');
    if (error) throw error;
    const remotos = new Map((data ?? []).map((r) => [r.tema as string, r.datos as Progreso]));
    const temas = new Set([...progressStore.temas(), ...remotos.keys()]);
    for (const tema of temas) {
      const local = progressStore.getSnapshot()?.[tema] ?? vacio();
      const remoto = remotos.get(tema) ?? null;
      const unido = remoto ? mergeProgreso(local, remoto) : local;
      if (!mismoProgreso(unido, local)) progressStore.aplicarRemoto(tema, unido);
      if (!remoto || !mismoProgreso(unido, remoto)) {
        const { error: e } = await sb.from('estado').upsert({ tema, datos: unido, actualizado: new Date().toISOString() }, { onConflict: 'user_id,tema' });
        if (e) throw e;
      }
      // 2) Registros C3: enviar pendientes
      const regs = progressStore.registros(tema);
      for (const sesion of progressStore.pendientes(tema)) {
        const r = regs[sesion];
        if (r) {
          const { error: e } = await sb.from('registro').upsert(registroToRow(r), { onConflict: 'user_id,tema,sesion' });
          if (e) throw e;
        }
        progressStore.marcarEnviado(tema, sesion);
      }
    }

    // 3) Registros C3: traer los que este dispositivo no tenga (por ejemplo, de un dispositivo nuevo)
    const { data: filas, error: e3 } = await sb.from('registro').select('*');
    if (e3) throw e3;
    for (const f of (filas ?? []) as RegistroRow[]) {
      const mio = progressStore.registros(f.tema)[f.sesion];
      if (!mio || mio.actualizado < f.actualizado) progressStore.guardarRegistro(rowToRegistro(f), false);
    }
    return 'ok';
  },
};
