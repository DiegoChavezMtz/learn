import type { Curso } from '@/types/curso';

/** Páginas que deben quedar disponibles sin conexión: la navegación del curso y todo lo de los temas con lección. */
export function rutasOffline(c: Curso): string[] {
  const base = ['/', '/hoy', '/videos', '/progreso', '/cuenta', ...c.modulos.map((m) => `/curso/${m.n}`)];
  const temas = c.modulos.flatMap((m) => m.temas).filter((t) => t.leccion).flatMap((t) => [
    `/tema/${t.id}`, `/tema/${t.id}/repaso`, `/tema/${t.id}/repasar`, `/tema/${t.id}/libro`,
    ...t.leccion!.sesiones.map((s) => `/tema/${t.id}/sesion/${s.id}`),
  ]);
  return [...base, ...temas];
}
