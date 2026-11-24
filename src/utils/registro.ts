import type { Sesion } from '@/types/lesson';
import type { Registro, StatsSesion } from '@/types/progreso';

export function construirRegistro(args: {
  tema: string; sesion: Sesion; stats: StatsSesion; inicio: number; interes: number | null; claridad: number | null; nota: string;
}): Registro {
  const { tema, sesion, stats, inicio, interes, claridad, nota } = args;
  const ahora = new Date().toISOString();
  return {
    tema, sesion: sesion.id, paso: sesion.paso, titulo: sesion.titulo,
    duracionPlan: `${sesion.minutos} min`,
    duracionRealMin: Math.max(1, Math.round((Date.now() - inicio) / 60000)),
    inicio: new Date(inicio).toISOString(), fin: ahora,
    aciertos: stats.aciertos, preguntas: stats.total, mini: stats.mini, ia: stats.ia,
    interes, claridad, nota, texto: stats.texto, terminada: true, actualizado: ahora, version: 'web-1',
  };
}
