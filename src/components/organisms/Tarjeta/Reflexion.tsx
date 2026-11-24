'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Tarjeta } from '@/types/lesson';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Reflexion({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'reflexion' }>>) {
  const [elegida, setElegida] = useState<number | null>(null);
  return (
    <>
      <span className={styles.kicker}>{kicker} · tu forma de trabajar</span>
      <h2>{c.pregunta}</h2>
      <div className={styles.opts}>
        {c.opciones.map((o, k) => (
          <button
            key={k} type="button" className={styles.opt} disabled={elegida !== null} aria-pressed={elegida === k}
            onClick={() => { setElegida(k); stats.guardarTexto(c.id, o); }}
          >
            {o}
          </button>
        ))}
      </div>
      {c.nota && <p className={`${styles.muted} ${styles.small}`}>{c.nota}</p>}
      {elegida !== null && <div className={styles.actions}><Button onClick={onNext}>Siguiente</Button></div>}
    </>
  );
}
