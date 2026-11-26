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

/** izquierda → derecha, con índices de `pares`. La pareja correcta es i → i. */
type Mapa = Record<number, number>;

/** Une cada elemento de la izquierda con el de la derecha: se toca uno y luego el otro. Acierto si todas las parejas quedan bien. */
export function Emparejar({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'emparejar' }>>) {
  const { calificar } = useProgreso();
  const [izq] = useState(() => shuffle(c.pares.map((_, k) => k)));
  const [der] = useState(() => shuffle(c.pares.map((_, k) => k)));
  const [sel, setSel] = useState<number | null>(null);
  const [mapa, setMapa] = useState<Mapa>({});
  const [cerrado, setCerrado] = useState(false);
  const bien = cerrado && c.pares.every((_, i) => mapa[i] === i);

  // Se llama desde un toque, nunca durante el render: al completar todas las parejas, se califica una vez.
  const cerrar = (nuevo: Mapa) => {
    setMapa(nuevo);
    setSel(null);
    if (Object.keys(nuevo).length === c.pares.length) {
      const ok = c.pares.every((_, i) => nuevo[i] === i);
      setCerrado(true);
      stats.responder(ok, c.pares.map(([a, b]) => `${a}→${b}`).join(' · '));
      if (c.repaso) calificar(c.id, ok);
    }
  };

  const sinPareja = (m: Mapa, quitar: number) => { const n = { ...m }; delete n[quitar]; return n; };
  const izquierdaDe = (j: number) => Object.keys(mapa).map(Number).find((i) => mapa[i] === j);

  const tocarIzq = (i: number) => {
    if (cerrado) return;
    if (mapa[i] !== undefined) { setMapa(sinPareja(mapa, i)); setSel(null); return; } // tocar una unida la deshace
    setSel(sel === i ? null : i);
  };
  const tocarDer = (j: number) => {
    if (cerrado) return;
    const i = izquierdaDe(j);
    if (i !== undefined) { setMapa(sinPareja(mapa, i)); return; }
    if (sel !== null) cerrar({ ...mapa, [sel]: j });
  };
  const reiniciar = () => { setMapa({}); setSel(null); };

  return (
    <>
      <span className={styles.kicker}>{kicker} · une las parejas</span>
      <Pregunta texto={c.pregunta} />
      <div className={styles.pares}>
        <div className={styles.columna}>
          {izq.map((i) => (
            <button
              key={`l${i}`} type="button" disabled={cerrado} onClick={() => tocarIzq(i)}
              className={clsx(
                styles.opt, styles.par,
                cerrado ? (mapa[i] === i ? styles.right : styles.wrong) : (sel === i && styles.sel) || (mapa[i] !== undefined && styles.unido),
              )}
            >
              {c.pares[i][0]}
            </button>
          ))}
        </div>
        <div className={styles.columna}>
          {der.map((j) => {
            const usada = izquierdaDe(j) !== undefined;
            return (
              <button
                key={`r${j}`} type="button" disabled={cerrado} onClick={() => tocarDer(j)}
                className={clsx(
                  styles.opt, styles.par,
                  cerrado ? (mapa[j] === j ? styles.right : styles.wrong) : (usada && styles.unido) || (sel !== null && styles.objetivo),
                )}
              >
                {c.pares[j][1]}
              </button>
            );
          })}
        </div>
      </div>
      {cerrado ? (
        <Feedback bien={bien} texto={bien ? c.explica : `Parejas correctas: ${c.pares.map(([a, b]) => `${a} → ${b}`).join(' · ')}. ${c.explica}`} onNext={onNext} />
      ) : (
        <>
          <p className={clsx(styles.muted, styles.small)}>
            {sel === null ? 'Toca un elemento de la izquierda y después su pareja. Tocar una unida la deshace.' : 'Ahora toca su pareja de la derecha.'}
          </p>
          {Object.keys(mapa).length > 0 && <div className={styles.actions}><Button variant="ghost" onClick={reiniciar}>Reiniciar</Button></div>}
        </>
      )}
    </>
  );
}
