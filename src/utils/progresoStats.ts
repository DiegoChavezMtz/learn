import type { Progreso, Registro } from '@/types/progreso';
import { addDays } from './dates';
import { INTERVALOS, vencidos } from './spacedRepetition';

const promedio = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** La racha más larga de días consecutivos con actividad. */
export function mejorRacha(dias: string[]): number {
  const ord = [...new Set(dias)].sort();
  let mejor = 0, act = 0, prev = '';
  for (const d of ord) { act = prev && addDays(prev, 1) === d ? act + 1 : 1; mejor = Math.max(mejor, act); prev = d; }
  return mejor;
}

export function estadisticas(todos: Record<string, Progreso>, registros: Registro[], dias: string[], hoy: string) {
  const sesiones = Object.values(todos).reduce((s, p) => s + Object.values(p.sesiones).filter((x) => x.terminada).length, 0);
  const cajas = INTERVALOS.map(() => 0);
  let tarjetas = 0, pendientes = 0;
  for (const p of Object.values(todos)) {
    for (const r of Object.values(p.repaso)) { cajas[Math.min(r.caja, cajas.length - 1)]++; tarjetas++; }
    pendientes += vencidos(p.repaso, hoy).length;
  }
  const set = new Set(dias);
  return {
    sesiones, tarjetas, pendientes, cajas,
    diasTotal: set.size, mejorRacha: mejorRacha(dias),
    minutos: Math.round(registros.reduce((s, r) => s + (r.duracionRealMin || 0), 0)),
    interes: promedio(registros.flatMap((r) => (r.interes ? [r.interes] : []))),
    claridad: promedio(registros.flatMap((r) => (r.claridad ? [r.claridad] : []))),
    // 12 semanas hacia atrás, terminando hoy
    mapa: [...Array(84)].map((_, i) => { const f = addDays(hoy, i - 83); return { f, on: set.has(f) }; }),
  };
}
