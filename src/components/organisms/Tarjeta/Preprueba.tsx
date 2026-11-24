'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { shuffle } from '@/utils/shuffle';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Preprueba({ tarjeta: c, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'preprueba' }>>) {
  const { guardarPreprueba } = useProgreso();
  // La última opción es "No sé" y se queda al final.
  const [orden] = useState(() => shuffle([...Array(c.opciones.length - 1).keys()]).concat([c.opciones.length - 1]));
  const [elegida, setElegida] = useState<number | null>(null);

  const elegir = (k: number) => {
    setElegida(k);
    guardarPreprueba(c.id, k);
    stats.guardarTexto(c.id, c.opciones[k]);
    stats.participar();
  };

  return (
    <>
      <span className={styles.kicker}>Antes de aprender · sin buscar nada</span>
      <h2>{c.pregunta}</h2>
      <div className={styles.opts}>
        {orden.map((k) => (
          <button key={k} type="button" className={styles.opt} disabled={elegida !== null} aria-pressed={elegida === k} onClick={() => elegir(k)}>
            {c.opciones[k]}
          </button>
        ))}
      </div>
      {elegida !== null && (
        <div className={styles.actions}>
          <p className={`${styles.muted} ${styles.small}`}>Guardado. Lo revisamos al final del tema.</p>
          <Button onClick={onNext}>Siguiente</Button>
        </div>
      )}
    </>
  );
}
