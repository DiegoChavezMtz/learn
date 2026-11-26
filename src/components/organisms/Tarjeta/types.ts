import type { Evaluacion, Mini, ResultadoCorta } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';

/** Lo que una tarjeta puede reportar al reproductor. */
export type StatsApi = {
  /** Respuesta con acierto/fallo (opción, V/F, orden, emparejar, clasificar, armar, error). `respuesta` queda en el historial. */
  responder: (bien: boolean, respuesta?: string) => void;
  /** Participación sin respuesta correcta (preprueba): mismo XP con cualquier respuesta. */
  participar: () => void;
  guardarTexto: (tarjetaId: string, texto: string) => void;
  guardarMini: (mini: Mini, ia: Evaluacion | null) => void;
  /** Respuesta corta terminada: solo ✅ cuenta como acierto; XP según la revisó el tutor (escala) o la persona (fijo). */
  corta: (resultado: ResultadoCorta, tutor: boolean) => void;
  /** Anota un intento en el historial (C3) sin contarlo como respuesta de la sesión (p. ej., el primer intento de la corta). */
  intento: (resultado: ResultadoCorta, respuesta: string) => void;
};

export type CardProps<T> = { tarjeta: T; kicker: string; onNext: () => void; stats: StatsApi; evaluar?: Evaluador };
