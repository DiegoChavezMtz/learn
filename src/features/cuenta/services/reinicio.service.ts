import { getSupabase } from '@/lib/supabase';

/** Reinicio (D40): borra en la nube el avance de un tema. Solo lo llama el reinicio, después de que el respaldo se descargó. */
export const reinicioService = {
  /** Sin Supabase configurado no hay nube que borrar: se devuelve 'sin-config' y el reinicio sigue en el dispositivo. */
  async borrarTemaEnNube(tema: string): Promise<'ok' | 'sin-config'> {
    const sb = getSupabase();
    if (!sb) return 'sin-config';
    const { error: eRegistro } = await sb.from('registro').delete().eq('tema', tema);
    if (eRegistro) throw eRegistro;
    const { error: eEstado } = await sb.from('estado').delete().eq('tema', tema);
    if (eEstado) throw eEstado;
    return 'ok';
  },
};
