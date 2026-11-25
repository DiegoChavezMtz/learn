'use client';
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { progressStore, vacio, type Todos } from '@/lib/progressStore';
import type { Mini, Progreso, Registro } from '@/types/progreso';
import { isoDay } from '@/utils/dates';
import { calificar as calificarRepaso } from '@/utils/spacedRepetition';
import { META_DIARIA, XP, xpDelDia, xpTotal } from '@/utils/xp';
import { racha as calcularRacha } from '@/utils/streak';
import { useModoLibre, useTema } from './TemaContext';

type Info = { aciertos: number; total: number; mini: Mini | null };
type CursoCtx = {
  /** false en el servidor y en el primer render: aún no se leyó el progreso del dispositivo. */
  listo: boolean;
  todos: Todos;
  /** Días con actividad en cualquier tema (la racha es del curso, no de un tema). */
  dias: string[];
  racha: number;
  hoy: string;
  /** Puntos de experiencia (XP): de hoy, totales y la meta diaria. */
  xpHoy: number;
  xpTotal: number;
  meta: number;
  calificar: (tema: string, tarjetaId: string, bien: boolean) => void;
  guardarPreprueba: (tema: string, tarjetaId: string, respuesta: number) => void;
  marcarDia: (tema: string) => void;
  sumarXp: (tema: string, puntos: number) => void;
  terminarSesion: (tema: string, id: string, info: Info, registro: Registro) => void;
};

const Ctx = createContext<CursoCtx | null>(null);

const conDia = (p: Progreso, hoy: string): Progreso =>
  p.dias.includes(hoy) ? p : { ...p, dias: [...p.dias, hoy].slice(-120) };
const conXp = (p: Progreso, hoy: string, n: number): Progreso => ({ ...p, xp: { ...(p.xp ?? {}), [hoy]: (p.xp?.[hoy] ?? 0) + n } });

export function ProgresoProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(progressStore.subscribe, progressStore.getSnapshot, progressStore.getServerSnapshot);

  const calificar = useCallback((tema: string, id: string, bien: boolean) => {
    const hoy = isoDay();
    progressStore.update(tema, (p) => ({ ...p, repaso: { ...p.repaso, [id]: calificarRepaso(p.repaso[id], bien, hoy) } }));
  }, []);
  const guardarPreprueba = useCallback((tema: string, id: string, respuesta: number) => {
    progressStore.update(tema, (p) => ({ ...p, preprueba: { ...p.preprueba, [id]: respuesta } }));
  }, []);
  const marcarDia = useCallback((tema: string) => {
    const hoy = isoDay();
    progressStore.update(tema, (p) => conDia(p, hoy));
  }, []);
  const sumarXp = useCallback((tema: string, puntos: number) => {
    const hoy = isoDay();
    progressStore.update(tema, (p) => conXp(conDia(p, hoy), hoy, puntos));
  }, []);
  const terminarSesion = useCallback<CursoCtx['terminarSesion']>((tema, id, info, registro) => {
    const hoy = isoDay();
    progressStore.update(tema, (p) => conXp(conDia({ ...p, sesiones: { ...p.sesiones, [id]: { terminada: true, fecha: hoy, ...info } } }, hoy), hoy, XP.sesion));
    progressStore.guardarRegistro(registro);
  }, []);

  const value = useMemo<CursoCtx>(() => {
    const listo = snap !== null;
    const todos = snap ?? {};
    const hoy = listo ? isoDay() : '';
    const dias = [...new Set(Object.values(todos).flatMap((p) => p.dias))].sort();
    return {
      listo, todos, dias, hoy, racha: listo ? calcularRacha(dias, hoy) : 0,
      xpHoy: listo ? xpDelDia(todos, hoy) : 0, xpTotal: xpTotal(todos), meta: META_DIARIA,
      calificar, guardarPreprueba, marcarDia, sumarXp, terminarSesion,
    };
  }, [snap, calificar, guardarPreprueba, marcarDia, sumarXp, terminarSesion]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Todo el curso: lo usan Hoy, el mapa del curso y el progreso. */
export function useProgresoCurso(): CursoCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgresoCurso debe usarse dentro de ProgresoProvider');
  return c;
}

/** El progreso del microtema actual (requiere TemaProvider): lo usan las tarjetas y las vistas de sesión y repaso. */
export function useProgreso() {
  const c = useProgresoCurso();
  const tema = useTema();
  const libre = useModoLibre();
  return useMemo(() => ({
    listo: c.listo, tema, hoy: c.hoy, racha: c.racha,
    progreso: c.todos[tema] ?? vacio(),
    // En práctica libre, calificar no cambia cajas ni fechas del repaso espaciado.
    calificar: (id: string, bien: boolean) => { if (!libre) c.calificar(tema, id, bien); },
    guardarPreprueba: (id: string, r: number) => c.guardarPreprueba(tema, id, r),
    marcarDia: () => c.marcarDia(tema),
    sumarXp: (n: number) => c.sumarXp(tema, n),
    xpHoy: c.xpHoy, meta: c.meta,
    terminarSesion: (id: string, info: Info, registro: Registro) => c.terminarSesion(tema, id, info, registro),
  }), [c, tema, libre]);
}
