import type { Mini, Progreso } from '@/types/progreso';

/** Puntos de experiencia: premian el esfuerzo (intentar suma algo) pero más acertar y terminar. */
export const XP = {
  acierto: 10,
  intento: 2,
  sesion: 30,
  /** Explicación revisada por el tutor: la escala premia lo que de verdad se explicó. */
  explica: { ok: 20, huecos: 10, no: 5 } as Record<Mini, number>,
  /** Explicación autocalificada: XP fijo, para que decir "Salió" no rinda más que ser honesto (D24). */
  explicaAuto: 15,
  /** Preprueba: mismo XP con cualquier respuesta, incluida "No sé" (no hay respuesta correcta que premiar). */
  preprueba: 5,
} as const;

export const META_DIARIA = 60;

export const xpDelDia = (todos: Record<string, Progreso>, dia: string) =>
  Object.values(todos).reduce((s, p) => s + (p.xp?.[dia] ?? 0), 0);

export const xpTotal = (todos: Record<string, Progreso>) =>
  Object.values(todos).reduce((s, p) => s + Object.values(p.xp ?? {}).reduce((a, b) => a + b, 0), 0);

/** Nivel: el 1 empieza en 0 XP y cada uno cuesta más que el anterior (nivel n empieza en 40·(n−1)² XP). */
export function nivel(xp: number) {
  const n = Math.floor(Math.sqrt(xp / 40)) + 1;
  const desde = 40 * (n - 1) ** 2, hasta = 40 * n ** 2;
  return { nivel: n, xp, desde, hasta, faltan: hasta - xp, pct: Math.round(((xp - desde) / (hasta - desde)) * 100) };
}
