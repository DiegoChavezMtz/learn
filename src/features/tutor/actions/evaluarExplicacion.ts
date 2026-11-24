'use server';
import type { PeticionTutor, RespuestaTutor } from '@/types/tutor';
import { tutorService } from '../services/tutor.service';

/** Server action: la tarjeta "explica" la invoca; la llave de MiniMax nunca sale del servidor. */
export async function evaluarExplicacion(p: PeticionTutor): Promise<RespuestaTutor> {
  if (!tutorService.disponible()) return { ok: false, error: 'no-disponible' };
  if (!(await tutorService.sesionValida(p.token))) return { ok: false, error: 'sin-sesion' };
  if (!tutorService.entradaValida(p)) return { ok: false, error: 'texto-invalido' };
  try {
    const evaluacion = await tutorService.evaluar(p);
    return evaluacion ? { ok: true, evaluacion } : { ok: false, error: 'no-disponible' };
  } catch {
    return { ok: false, error: 'no-disponible' };
  }
}
