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

/** Cada elemento va a su grupo: se toca el elemento y luego el grupo. Acierto si todos quedan en su grupo. */
export function Clasificar({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'clasificar' }>>) {
  const { calificar } = useProgreso();
  const [pool, setPool] = useState<number[]>(() => shuffle(c.items.map((_, k) => k)));
  const [colocado, setColocado] = useState<Record<number, number>>({}); // elemento → grupo elegido
  const [sel, setSel] = useState<number | null>(null);
  const [cerrado, setCerrado] = useState(false);
  const bien = cerrado && c.items.every((it, k) => colocado[k] === it.grupo);

  // Se llama desde un toque: al colocar el último elemento, se califica una vez.
  const colocar = (k: number, g: number) => {
    const nuevo = { ...colocado, [k]: g };
    setColocado(nuevo);
    setPool(pool.filter((x) => x !== k));
    setSel(null);
    if (Object.keys(nuevo).length === c.items.length) {
      const ok = c.items.every((it, n) => nuevo[n] === it.grupo);
      setCerrado(true);
      stats.responder(ok, c.items.map((it, n) => `${it.texto}→${c.grupos[nuevo[n]]}`).join(' · '));
      if (c.repaso) calificar(c.id, ok);
    }
  };

  const quitar = (k: number) => {
    const n = { ...colocado };
    delete n[k];
    setColocado(n);
    setPool([...pool, k]);
  };

  const tocarItem = (k: number) => { if (!cerrado) setSel(sel === k ? null : k); };
  const tocarGrupo = (g: number) => { if (!cerrado && sel !== null) colocar(sel, g); };

  const enGrupo = (g: number) => Object.keys(colocado).map(Number).filter((k) => colocado[k] === g);

  return (
    <>
      <span className={styles.kicker}>{kicker} · clasifica</span>
      <Pregunta texto={c.pregunta} />
      {!cerrado && (
        <div className={styles.picked}>
          {pool.length > 0 ? (
            <div className={styles.chips}>
              {pool.map((k) => (
                <button key={k} type="button" onClick={() => tocarItem(k)} className={clsx(styles.chip, sel === k && styles.sel)}>
                  {c.items[k].texto}
                </button>
              ))}
            </div>
          ) : null}
          <p className={clsx(styles.muted, styles.small)}>
            {sel === null ? (pool.length ? 'Toca un elemento y luego el grupo donde va.' : '') : `«${c.items[sel].texto}»: ¿en qué grupo va?`}
          </p>
        </div>
      )}
      <div className={styles.opts}>
        {c.grupos.map((nombre, g) => (
          <div
            key={g} role="button" tabIndex={cerrado ? -1 : 0} aria-disabled={cerrado}
            onClick={() => tocarGrupo(g)}
            className={clsx(styles.grupo, !cerrado && sel !== null && styles.objetivo)}
          >
            <span className={styles.grupoTitulo}>{nombre}</span>
            <span className={styles.chips}>
              {enGrupo(g).map((k) => {
                const bienEn = cerrado ? c.items[k].grupo === g : undefined;
                return (
                  <span
                    key={k} role={cerrado ? undefined : 'button'} tabIndex={cerrado ? undefined : 0}
                    onClick={(e) => { if (!cerrado) { e.stopPropagation(); quitar(k); } }}
                    className={clsx(styles.chip, bienEn === true && styles.right, bienEn === false && styles.wrong)}
                  >
                    {c.items[k].texto}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      {cerrado ? (
        <Feedback
          bien={bien}
          texto={bien ? c.explica : `Así iba: ${c.items.map((it) => `${it.texto} → ${c.grupos[it.grupo]}`).join(' · ')}. ${c.explica}`}
          onNext={onNext}
        />
      ) : (
        Object.keys(colocado).length > 0 && <div className={styles.actions}><Button variant="ghost" onClick={() => { setColocado({}); setPool(shuffle(c.items.map((_, k) => k))); setSel(null); }}>Reiniciar</Button></div>
      )}
    </>
  );
}
