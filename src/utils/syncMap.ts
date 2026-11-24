import type { Registro } from '@/types/progreso';

/** Fila de la tabla `registro` de Supabase (snake_case). */
export type RegistroRow = {
  tema: string; sesion: string; paso: string | null; titulo: string | null; duracion_plan: string | null;
  duracion_real_min: number | null; inicio: string | null; fin: string | null; aciertos: number | null; preguntas: number | null;
  mini: Registro['mini']; ia: Registro['ia']; interes: number | null; claridad: number | null; nota: string | null;
  texto: Record<string, string> | null; terminada: boolean; actualizado: string; version: string | null;
};

export const registroToRow = (r: Registro): RegistroRow => ({
  tema: r.tema, sesion: r.sesion, paso: r.paso ?? null, titulo: r.titulo ?? null, duracion_plan: r.duracionPlan ?? null,
  duracion_real_min: r.duracionRealMin ?? null, inicio: r.inicio ?? null, fin: r.fin ?? null,
  aciertos: r.aciertos ?? null, preguntas: r.preguntas ?? null, mini: r.mini ?? null, ia: r.ia ?? null,
  interes: r.interes ?? null, claridad: r.claridad ?? null, nota: r.nota ?? null, texto: r.texto ?? null,
  terminada: r.terminada ?? true, actualizado: r.actualizado ?? new Date().toISOString(), version: r.version ?? null,
});

export const rowToRegistro = (w: RegistroRow): Registro => ({
  tema: w.tema, sesion: w.sesion, paso: w.paso ?? '', titulo: w.titulo ?? '', duracionPlan: w.duracion_plan ?? '',
  duracionRealMin: w.duracion_real_min ?? 0, inicio: w.inicio ?? '', fin: w.fin ?? '',
  aciertos: w.aciertos ?? 0, preguntas: w.preguntas ?? 0, mini: w.mini, ia: w.ia,
  interes: w.interes, claridad: w.claridad, nota: w.nota ?? '', texto: w.texto ?? {},
  terminada: w.terminada, actualizado: w.actualizado, version: w.version ?? '',
});
