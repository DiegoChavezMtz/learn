import type { ItemTarjeta, Leccion, Paso, Sesion, Tarjeta } from '@/types/lesson';
import type { EstadoRepaso } from '@/types/progreso';
import { shuffle } from './shuffle';
import { vencidos } from './spacedRepetition';

export const pasoColor: Record<Paso, string> = {
  Orientar: 'var(--l5)', Exponer: 'var(--l2)', Practicar: 'var(--l4)',
  Explicar: 'var(--l3)', Consolidar: 'var(--l1)', Registrar: 'var(--l1)',
};
export const layerColor = (n: number) => (n >= 5 ? 'var(--l5)' : `var(--l${n})`);
export const etiqueta = (id: string) => id.replace(/^md/, 'MD').replace(/^bl/, 'BL');

export const buscarSesion = (l: Leccion, id: string): Sesion | undefined => l.sesiones.find((s) => s.id === id);

export function buscarTarjeta(l: Leccion, id: string): { tarjeta: Tarjeta; sesion: Sesion } | null {
  for (const sesion of l.sesiones) for (const tarjeta of sesion.tarjetas) if (tarjeta.id === id) return { tarjeta, sesion };
  return null;
}

export const siguienteSesion = (l: Leccion, hechas: Record<string, { terminada: boolean }>): Sesion | undefined =>
  l.sesiones.find((s) => !hechas[s.id]?.terminada);

/** Los videos solo aparecen si ya están publicados (C1/C2). Las URLs `/_blob/…` eran del artefacto y no existen en la web. */
export const esVideoPublicado = (t: Tarjeta) => t.tipo !== 'video' || (!!t.src && !t.src.startsWith('/_blob/'));

export const itemsDeSesion = (s: Sesion): ItemTarjeta[] =>
  s.tarjetas.filter(esVideoPublicado).map((tarjeta) => ({ tarjeta, paso: s.paso }));

export function idsPendientes(l: Leccion, repaso: Record<string, EstadoRepaso>, hoy: string): string[] {
  return vencidos(repaso, hoy).filter((id) => buscarTarjeta(l, id));
}

/** Cola de repaso: hasta 12 tarjetas al azar. */
export function colaRepaso(l: Leccion, ids: string[]): ItemTarjeta[] {
  return shuffle(ids).slice(0, 12).flatMap((id) => {
    const f = buscarTarjeta(l, id);
    return f ? [{ tarjeta: f.tarjeta, paso: f.sesion.paso, repaso: true }] : [];
  });
}

export const minutosDeLaDosis = (nRepasos: number, sig?: Sesion) => Math.ceil(nRepasos * 0.5) + (sig?.minutos ?? 0);
