import Link from 'next/link';
import clsx from 'clsx';
import type { Leccion } from '@/types/lesson';
import { etiqueta } from '@/utils/lesson';
import styles from './Rail.module.css';

type Props = { tema: string; leccion: Pick<Leccion, 'mapa' | 'sesiones'>; terminadas: Record<string, { terminada: boolean }>; actualId?: string };

/** Mapa del tema: una casilla por sesión. Verde = terminada (se puede repetir), azul = la siguiente, rayada = aún no existe. */
export function Rail({ tema, leccion, terminadas, actualId }: Props) {
  return (
    <div className={styles.rail}>
      {leccion.mapa.map((id) => {
        const s = leccion.sesiones.find((x) => x.id === id);
        if (!s) return <i key={id} className={styles.soon} title={etiqueta(id)} />;
        const done = terminadas[id]?.terminada;
        return (
          <Link
            key={id} href={`/tema/${tema}/sesion/${id}`}
            className={clsx(done && styles.done, !done && actualId === id && styles.now)}
            aria-label={`${etiqueta(id)} · ${s.titulo}${done ? ' (terminada, tocar para repetir)' : ''}`}
          />
        );
      })}
    </div>
  );
}
