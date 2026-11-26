'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { Feedback } from './Feedback';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Vf({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'vf' }>>) {
  const { calificar } = useProgreso();
  const [elegida, setElegida] = useState<boolean | null>(null);

  const elegir = (v: boolean) => {
    const bien = v === c.verdadera;
    setElegida(v);
    stats.responder(bien, v ? 'Verdadero' : 'Falso');
    if (c.repaso) calificar(c.id, bien);
  };

  return (
    <>
      <span className={styles.kicker}>{kicker} · ¿verdadero o falso?</span>
      <h2>{c.afirmacion}</h2>
      <div className={styles.vf}>
        {[true, false].map((v) => (
          <button
            key={String(v)} data-icon={v ? '👍' : '👎'} type="button" disabled={elegida !== null} onClick={() => elegir(v)}
            className={clsx(styles.opt, elegida !== null && (v === c.verdadera ? styles.right : v === elegida && styles.wrong))}
          >
            {v ? 'Verdadero' : 'Falso'}
          </button>
        ))}
      </div>
      {elegida !== null && <Feedback bien={elegida === c.verdadera} texto={c.explica} onNext={onNext} />}
    </>
  );
}
