'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import type { Tarjeta } from '@/types/lesson';
import { shuffle } from '@/utils/shuffle';
import { Feedback } from './Feedback';
import { Pregunta } from './Pregunta';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

/** `k` es la posición en `piezas`; -1 si es un distractor (no va en la estructura). */
type Pieza = { t: string; k: number };

/** Se arma la estructura tocando las piezas en orden. Cada toque da respuesta al instante; un toque equivocado no suma. */
export function Armar({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'armar' }>>) {
  const { calificar } = useProgreso();
  const nuevo = () => shuffle([...c.piezas.map((t, k): Pieza => ({ t, k })), ...(c.distractores ?? []).map((t): Pieza => ({ t, k: -1 }))]);
  const [pool, setPool] = useState<Pieza[]>(nuevo);
  const [armado, setArmado] = useState<Pieza[]>([]);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState('');
  const [cerrado, setCerrado] = useState(false);

  const tocar = (n: number) => {
    if (cerrado) return;
    const p = pool[n];
    if (p.k !== armado.length) {
      setErrores(errores + 1);
      setAviso(`«${p.t}» no es la pieza que sigue.`);
      return;
    }
    const siguiente = [...armado, p];
    setArmado(siguiente);
    setPool(pool.filter((_, i) => i !== n));
    setAviso('');
    if (siguiente.length === c.piezas.length) {
      const ok = errores === 0;
      setCerrado(true);
      stats.responder(ok, siguiente.map((x) => x.t).join(' → '));
      if (c.repaso) calificar(c.id, ok);
    }
  };

  const reiniciar = () => { setPool(nuevo()); setArmado([]); setErrores(0); setAviso(''); };

  return (
    <>
      <span className={styles.kicker}>{kicker} · arma la secuencia</span>
      <Pregunta texto={c.pregunta} />
      {/* La estructura crece hacia arriba: la primera pieza queda abajo. */}
      <div className={styles.torre} aria-label="Estructura armada">
        {armado.map((p, n) => (
          <div key={p.k} className={clsx(styles.pieza, cerrado && styles.right)}>
            <span className={styles.num}>{n + 1}</span>{p.t}
          </div>
        ))}
        {armado.length === 0 && <div className={clsx(styles.pieza, styles.vacia)}>Toca la primera pieza</div>}
      </div>
      {!cerrado && (
        <div className={styles.chips}>
          {pool.map((p, n) => (
            <button key={`${p.t}-${n}`} type="button" onClick={() => tocar(n)} className={styles.chip}>{p.t}</button>
          ))}
        </div>
      )}
      {!cerrado && aviso && <p className={clsx(styles.note, styles.err)} aria-live="polite">{aviso}</p>}
      {cerrado ? (
        <Feedback bien={errores === 0} texto={errores === 0 ? c.explica : `Orden correcto: ${c.piezas.join(' → ')}. ${c.explica}`} onNext={onNext} />
      ) : (
        (armado.length > 0 || errores > 0) && <div className={styles.actions}><Button variant="ghost" onClick={reiniciar}>Empezar de nuevo</Button></div>
      )}
    </>
  );
}
