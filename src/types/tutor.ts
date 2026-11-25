import type { Evaluacion } from './progreso';

/** `explica` (1 a 5 min) o `corta` (1-2 frases, con respuesta de referencia). */
export type PeticionTutor = { tipo?: 'explica' | 'corta'; prompt: string; puntos: string[]; texto: string; token: string; referencia?: string };
export type RespuestaTutor =
  | { ok: true; evaluacion: Evaluacion }
  | { ok: false; error: 'sin-sesion' | 'no-disponible' | 'texto-invalido' };

/** Lo que la tarjeta "explica" necesita del tutor; lo provee la feature `tutor` (vía app/) como server action. */
export type Evaluador = (p: PeticionTutor) => Promise<RespuestaTutor>;
