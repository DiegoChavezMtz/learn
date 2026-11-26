import type { EstadoRepaso } from '@/types/progreso';
import { addDays } from './dates';

// Intervalos del repaso espaciado (C1): 1, 3, 7, 14, 30 y 60 días.
export const INTERVALOS = [1, 3, 7, 14, 30, 60] as const;

/** Acierto → sube de caja; fallo → caja 0 (vuelve mañana). */
export function calificar(prev: EstadoRepaso | undefined, bien: boolean, hoy: string): EstadoRepaso {
  const caja = bien ? Math.min(prev ? prev.caja + 1 : 0, INTERVALOS.length - 1) : 0;
  return {
    caja,
    proxima: addDays(hoy, INTERVALOS[caja]),
    veces: (prev?.veces ?? 0) + 1,
    fallos: (prev?.fallos ?? 0) + (bien ? 0 : 1),
  };
}

/** `ayuda` (C1 v0.13): no fue de memoria a la primera, así que vuelve pronto (caja 1) y cuenta como fallo para «Puntos débiles». */
export function calificarAyuda(prev: EstadoRepaso | undefined, hoy: string): EstadoRepaso {
  return { caja: 1, proxima: addDays(hoy, INTERVALOS[1]), veces: (prev?.veces ?? 0) + 1, fallos: (prev?.fallos ?? 0) + 1 };
}

export const vencidos =(repaso: Record<string, EstadoRepaso>, hoy: string): string[] =>
  Object.entries(repaso).filter(([, r]) => r.proxima <= hoy).map(([id]) => id);
