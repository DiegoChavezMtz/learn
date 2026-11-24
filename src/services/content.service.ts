import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Curso } from '@/types/curso';
import type { Leccion, Libro } from '@/types/lesson';
import { esVideoPublicado } from '@/utils/lesson';

// El contenido C1 lo copia `npm run sync:content` desde App/ a Web/content/ (y genera curso.json). Solo servidor.
const read = async <T>(file: string): Promise<T> =>
  JSON.parse(await readFile(path.join(process.cwd(), 'content', file), 'utf8')) as T;

const existe = (file: string) => readFile(path.join(process.cwd(), 'content', file)).then(() => true, () => false);

type Videos = Record<string, { src: string; subs?: string | null }>;

/** Los videos publicados (content/videos.json, lo escribe `npm run publish:videos`) mandan sobre el `src` de la lección (C2). */
async function conVideos(l: Leccion): Promise<Leccion> {
  const v = await read<Videos>('videos.json').catch((): Videos => ({}));
  return {
    ...l,
    sesiones: l.sesiones.map((s) => ({
      ...s,
      tarjetas: s.tarjetas.map((t) => {
        if (t.tipo !== 'video') return t;
        const pub = v[t.video];
        return pub ? { ...t, src: pub.src, subs: pub.subs ?? undefined } : { ...t, src: t.src.startsWith('/_blob/') ? '' : t.src };
      }),
    })),
  };
}

export const contentService = {
  getCurso: () => read<Curso>('curso.json'),
  getLeccion: async (tema: string) => conVideos(await read<Leccion>(`leccion-${tema}.json`)),
  getLibro: (tema: string) => read<Libro>(`tema-${tema}.json`),
  hayLibro: (tema: string) => existe(`tema-${tema}.json`),
  /** URLs de los videos ya publicados de una lección (C2): se guardan para verlos sin conexión. */
  async videosPublicados(tema: string): Promise<string[]> {
    const l = await contentService.getLeccion(tema).catch(() => null);
    return (l?.sesiones ?? []).flatMap((s) => s.tarjetas).flatMap((t) => (t.tipo === 'video' && esVideoPublicado(t) ? [t.src, ...(t.subs ? [t.subs] : [])] : []));
  },
};
