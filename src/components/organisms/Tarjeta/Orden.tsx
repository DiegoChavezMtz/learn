'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { shuffle } from '@/utils/shuffle';
import { Feedback } from './Feedback';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

type Item = { t: string; k: number };

export function Orden({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'orden' }>>) {
  const { calificar } = useProgreso();
  const nuevo = () => shuffle(c.items.map((t, k) => ({ t, k })));
  const [pool, setPool] = useState<Item[]>(nuevo);
  const [picked, setPicked] = useState<Item[]>([]);
  const terminado = pool.length === 0;
  const bien = terminado && picked.every((p, n) => p.k === n);

  const tocar = (n: number) => {
    const item = pool[n];
    const nextPicked = [...picked, item];
    setPool(pool.filter((_, i) => i !== n));
    setPicked(nextPicked);
    if (nextPicked.length === c.items.length) {
      const ok = nextPicked.every((p, i) => p.k === i);
      stats.responder(ok, nextPicked.map((p) => p.t).join(' → '));
      if (c.repaso) calificar(c.id, ok);
    }
  };
  const reiniciar = () => { setPool(nuevo()); setPicked([]); };

  return (
    <>
      <span className={styles.kicker}>{kicker} · ordena</span>
      <h2>{c.pregunta}</h2>
      <div className={styles.picked}>
        {picked.map((p, n) => (
          <div key={p.k} className={clsx(styles.opt, terminado && (p.k === n ? styles.right : styles.wrong))}>
            <span className={styles.num}>{n + 1}</span>{p.t}
          </div>
        ))}
      </div>
      {!terminado && <p className={clsx(styles.muted, styles.small)}>Toca en orden:</p>}
      <div className={styles.opts}>
        {pool.map((p, n) => <button key={p.k} type="button" className={styles.opt} onClick={() => tocar(n)}>{p.t}</button>)}
      </div>
      {terminado ? (
        <Feedback bien={bien} texto={bien ? c.explica : `Orden correcto: ${c.items.join(' → ')}. ${c.explica ?? ''}`} onNext={onNext} />
      ) : (
        <div className={styles.actions}>{picked.length > 0 && <Button variant="ghost" onClick={reiniciar}>Reiniciar</Button>}</div>
      )}
    </>
  );
}
