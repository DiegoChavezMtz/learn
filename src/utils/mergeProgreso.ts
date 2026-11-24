import type { Progreso } from '@/types/progreso';

const max = (a: string | null, b: string | null) => (a && b ? (a > b ? a : b) : (a ?? b));

/** Une dos copias del progreso (dispositivo y nube, o archivo importado) sin perder nada de ninguna. Es conmutativa en lo esencial. */
export function mergeProgreso(a: Progreso, b: Progreso): Progreso {
  const sesiones = { ...b.sesiones };
  for (const [id, s] of Object.entries(a.sesiones)) {
    const o = sesiones[id];
    if (!o || (s.terminada && !o.terminada) || (s.terminada === o.terminada && s.fecha > o.fecha)) sesiones[id] = s;
  }
  const repaso = { ...b.repaso };
  for (const [id, r] of Object.entries(a.repaso)) {
    const o = repaso[id];
    // Más repasos hechos = copia más reciente de esa tarjeta.
    if (!o || r.veces > o.veces || (r.veces === o.veces && r.proxima > o.proxima)) repaso[id] = r;
  }
  // XP por día: los puntos solo crecen, así que de cada día vale el mayor (no se duplica al unir dos copias).
  const xp = { ...(b.xp ?? {}) };
  for (const [d, n] of Object.entries(a.xp ?? {})) xp[d] = Math.max(xp[d] ?? 0, n);
  return {
    sesiones, repaso, xp,
    dias: [...new Set([...a.dias, ...b.dias])].sort().slice(-120),
    preprueba: { ...b.preprueba, ...a.preprueba },
    actualizado: max(a.actualizado, b.actualizado),
  };
}

const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([p], [q]) => (p < q ? -1 : 1))) : x));

/** Igualdad por contenido, sin contar la marca de tiempo. */
export const mismoProgreso = (a: Progreso, b: Progreso) => stable({ ...a, actualizado: 0 }) === stable({ ...b, actualizado: 0 });
