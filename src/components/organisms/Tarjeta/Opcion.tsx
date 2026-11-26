'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { shuffle } from '@/utils/shuffle';
import { Feedback } from './Feedback';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Opcion({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'opcion' }>>) {
  const { calificar } = useProgreso();
  const [orden] = useState(() => shuffle(c.opciones.map((_, k) => k)));
  const [elegida, setElegida] = useState<number | null>(null);

  const elegir = (k: number) => {
    const bien = k === c.correcta;
    setElegida(k);
    stats.responder(bien, c.opciones[k]);
    if (c.repaso) calificar(c.id, bien);
  };

  return (
    <>
      <span className={styles.kicker}>{kicker} · pregunta</span>
      <h2>{c.pregunta}</h2>
      <div className={styles.opts}>
        {orden.map((k) => (
          <button
            key={k} type="button" disabled={elegida !== null} onClick={() => elegir(k)}
            className={clsx(styles.opt, elegida !== null && (k === c.correcta ? styles.right : k === elegida && styles.wrong))}
          >
            <span className={styles.letra}>{String.fromCharCode(65 + orden.indexOf(k))}</span>
            <span>{c.opciones[k]}</span>
          </button>
        ))}
      </div>
      {elegida !== null && <Feedback bien={elegida === c.correcta} texto={c.explica} onNext={onNext} />}
    </>
  );
}
