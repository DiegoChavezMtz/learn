'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { Feedback } from './Feedback';
import { Inline, Pregunta } from './Pregunta';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

/** Encontrar el error: se toca la parte equivocada. Una sola respuesta: acierto si es la que estaba mal. */
export function Hallar({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'error' }>>) {
  const { calificar } = useProgreso();
  const [elegida, setElegida] = useState<number | null>(null);
  const bien = elegida === c.incorrecta;

  const tocar = (k: number) => {
    if (elegida !== null) return;
    const ok = k === c.incorrecta;
    setElegida(k);
    stats.responder(ok, c.partes[k]);
    if (c.repaso) calificar(c.id, ok);
  };

  return (
    <>
      <span className={styles.kicker}>{kicker} · encuentra el error</span>
      <Pregunta texto={c.pregunta} />
      <div className={styles.opts}>
        {c.partes.map((p, k) => (
          <button
            key={k} type="button" disabled={elegida !== null} onClick={() => tocar(k)}
            className={clsx(
              styles.opt,
              elegida !== null && (k === c.incorrecta ? styles.right : k === elegida && styles.wrong),
            )}
          >
            <span className={styles.letra}>{String.fromCharCode(65 + k)}</span>
            <span><Inline texto={p} /></span>
          </button>
        ))}
      </div>
      {elegida !== null && (
        <Feedback bien={bien} texto={bien ? c.explica : `Lo que estaba mal: «${c.partes[c.incorrecta].replace(/\*\*/g, '')}». ${c.explica}`} onNext={onNext} />
      )}
    </>
  );
}
