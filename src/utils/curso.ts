import type { Curso, ModuloCurso, TemaCurso } from '@/types/curso';
import type { Progreso } from '@/types/progreso';
import { vencidos } from './spacedRepetition';

export const todosLosTemas = (c: Curso): TemaCurso[] => c.modulos.flatMap((m) => m.temas);
export const buscarTema = (c: Curso, id: string): { tema: TemaCurso; modulo: ModuloCurso } | null => {
  for (const modulo of c.modulos) { const tema = modulo.temas.find((t) => t.id === id); if (tema) return { tema, modulo }; }
  return null;
};
export const moduloDeTema = (id: string) => Number(id.split('.')[0]);
export const buscarModulo = (c: Curso, n: number) => c.modulos.find((m) => m.n === n);

/** Color del módulo: reutiliza la paleta de las capas, que ya es el hilo visual de la marca. */
export const colorModulo = (n: number) => `var(--l${[2, 3, 4, 5][(n - 1) % 4]})`;

export type EstadoTema = 'hecho' | 'en-curso' | 'disponible' | 'pronto';
export type Avance = { hechas: number; total: number; pct: number };

/** El avance se mide sobre lo ya publicado: cada sesión nueva que llega abre un paso más, no "borra" lo que llevas. */
/** Repasos vencidos de un tema que de verdad existen en su lección. Ignora tarjetas de versiones anteriores del contenido. */
export const repasosVencidos = (t: TemaCurso, repaso: Progreso['repaso'], hoy: string): number => {
  const ids = new Set(t.leccion?.repasables ?? []);
  return vencidos(repaso, hoy).filter((id) => ids.has(id)).length;
};

export const avanceTema = (t: TemaCurso, p: Progreso | undefined): Avance => {
  const total = t.leccion?.sesiones.length ?? 0;
  const hechas = t.leccion ? t.leccion.sesiones.filter((s) => p?.sesiones[s.id]?.terminada).length : 0;
  return { hechas, total, pct: total ? Math.round((hechas / total) * 100) : 0 };
};

export const estadoTema = (t: TemaCurso, p: Progreso | undefined): EstadoTema => {
  if (!t.leccion) return 'pronto';
  const a = avanceTema(t, p);
  return a.hechas === 0 ? 'disponible' : a.hechas >= a.total ? 'hecho' : 'en-curso';
};

export function avanceModulo(m: ModuloCurso, todos: Record<string, Progreso>) {
  const disponibles = m.temas.filter((t) => t.leccion);
  const hechos = disponibles.filter((t) => estadoTema(t, todos[t.id]) === 'hecho').length;
  return { temas: m.temas.length, disponibles: disponibles.length, hechos };
}

/** El siguiente paso del curso: el primer tema con lección que aún no está terminado, y su próxima sesión. */
export function siguientePaso(c: Curso, todos: Record<string, Progreso>) {
  for (const t of todosLosTemas(c)) {
    if (!t.leccion) continue;
    const p = todos[t.id];
    const sesion = t.leccion.sesiones.find((s) => !p?.sesiones[s.id]?.terminada);
    if (sesion) return { tema: t, sesion };
  }
  return null;
}
