import type { Evaluacion, Mini } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';

/** Lo que una tarjeta puede reportar al reproductor. */
export type StatsApi = {
  /** Respuesta con acierto/fallo (opción, V/F, orden). */
  responder: (bien: boolean) => void;
  /** Participación sin respuesta correcta (preprueba): mismo XP con cualquier respuesta. */
  participar: () => void;
  guardarTexto: (tarjetaId: string, texto: string) => void;
  guardarMini: (mini: Mini, ia: Evaluacion | null) => void;
};

export type CardProps<T> = { tarjeta: T; kicker: string; onNext: () => void; stats: StatsApi; evaluar?: Evaluador };
