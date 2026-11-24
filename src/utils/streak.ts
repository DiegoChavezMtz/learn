import { addDays } from './dates';

/** Días consecutivos con actividad; si hoy aún no se estudia, cuenta desde ayer. */
export function racha(dias: string[], hoy: string): number {
  const set = new Set(dias);
  let k = set.has(hoy) ? hoy : addDays(hoy, -1);
  let n = 0;
  while (set.has(k)) { n++; k = addDays(k, -1); }
  return n;
}
