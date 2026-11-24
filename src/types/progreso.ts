export type Mini = 'ok' | 'huecos' | 'no';
export type Evaluacion = { resultado: Mini; bien: string[]; huecos: string[]; comentario?: string };

export type EstadoRepaso = { caja: number; proxima: string; veces: number; fallos: number };
export type SesionHecha = { terminada: boolean; fecha: string; aciertos: number; total: number; mini: Mini | null };

/** Forma compatible con Equipo/export/estado/1.1.json (C4). */
export type Progreso = {
  sesiones: Record<string, SesionHecha>;
  repaso: Record<string, EstadoRepaso>;
  dias: string[];
  preprueba: Record<string, number>;
  /** Puntos de experiencia ganados por día (fecha → XP). Opcional: los progresos anteriores no lo traen. */
  xp?: Record<string, number>;
  actualizado: string | null;
};

/** Contrato C3. */
export type Registro = {
  tema: string; sesion: string; paso: string; titulo: string;
  duracionPlan: string; duracionRealMin: number; inicio: string; fin: string;
  aciertos: number; preguntas: number; mini: Mini | null; ia: Evaluacion | null;
  interes: number | null; claridad: number | null; nota: string;
  texto: Record<string, string>; terminada: boolean; actualizado: string; version: string;
};

/** Resultados acumulados mientras se reproducen tarjetas. */
export type StatsSesion = {
  /** XP ganados en esta sesión (sin contar el bono de terminarla). */
  xp: number;
  aciertos: number; total: number; mini: Mini | null; ia: Evaluacion | null; texto: Record<string, string>;
};
