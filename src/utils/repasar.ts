import type { ItemTarjeta, Leccion, Tarjeta } from '@/types/lesson';
import type { EstadoRepaso } from '@/types/progreso';
import { buscarTarjeta } from './lesson';
import { shuffle } from './shuffle';

/** Qué tarjetas entran al repaso (C1): las marcadas `repaso`, y `corta` y `explica` salvo `repaso: false`. */
export const repasable = (t: Tarjeta): boolean =>
  t.tipo === 'corta' || t.tipo === 'explica' ? t.repaso !== false
  : t.tipo === 'opcion' || t.tipo === 'vf' || t.tipo === 'orden' || t.tipo === 'emparejar' || t.tipo === 'clasificar' || t.tipo === 'armar' || t.tipo === 'error' ? t.repaso === true
  : false;

/** Tarjetas ya vistas (con estado de repaso), de todo el tema o de una sesión. */
export function vistas(l: Leccion, repaso: Record<string, EstadoRepaso>, sesionId?: string): string[] {
  return l.sesiones.filter((s) => !sesionId || s.id === sesionId).flatMap((s) => s.tarjetas.filter((t) => repasable(t) && repaso[t.id]).map((t) => t.id));
}

/** Puntos débiles: lo que más se ha fallado y aún está en las cajas bajas (0-2), de más a menos fallado. */
export function debiles(l: Leccion, repaso: Record<string, EstadoRepaso>): string[] {
  return Object.entries(repaso)
    .filter(([id, r]) => r.fallos > 0 && r.caja <= 2 && buscarTarjeta(l, id))
    .sort(([, a], [, b]) => b.fallos / Math.max(b.veces, 1) - a.fallos / Math.max(a.veces, 1) || b.fallos - a.fallos)
    .map(([id]) => id);
}

export const debilesSinCatalogo = (repaso: Record<string, EstadoRepaso>): number =>
  Object.values(repaso).filter((r) => r.fallos > 0 && r.caja <= 2).length;

/** Una ronda de práctica libre: hasta 12 tarjetas. */
export function rondaLibre(l: Leccion, ids: string[], alAzar: boolean): ItemTarjeta[] {
  return (alAzar ? shuffle(ids) : ids).slice(0, 12).flatMap((id) => {
    const f = buscarTarjeta(l, id);
    return f ? [{ tarjeta: f.tarjeta, paso: f.sesion.paso, sesion: f.sesion.id, repaso: true, libre: true }] : [];
  });
}
