import type { Evaluacion } from './progreso';

export type PeticionTutor = { prompt: string; puntos: string[]; texto: string; token: string };
export type RespuestaTutor =
  | { ok: true; evaluacion: Evaluacion }
  | { ok: false; error: 'sin-sesion' | 'no-disponible' | 'texto-invalido' };

/** Lo que la tarjeta "explica" necesita del tutor; lo provee la feature `tutor` (vía app/) como server action. */
export type Evaluador = (p: PeticionTutor) => Promise<RespuestaTutor>;
