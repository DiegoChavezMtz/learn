'use client';
import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import type { ModuloCurso } from '@/types/curso';
import { avanceTema, colorModulo, estadoTema } from '@/utils/curso';
import { enfocar } from '@/utils/enfoque';
import styles from './ModuloView.module.css';

/** Módulo en modo enfoque: tu tema actual en grande, lo hecho plegado y solo los 2 siguientes; lo demás, a pedido. */
export function ModuloView({ modulo: m }: { modulo: ModuloCurso }) {
  const { todos } = useProgresoCurso();
  const [verTodo, setVerTodo] = useState(false);
  const { hechos, actual, proximos, resto } = enfocar(m.temas, (t) => estadoTema(t, todos[t.id]) === 'hecho');
  const av = actual ? avanceTema(actual, todos[actual.id]) : null;
  const enCurso = actual && estadoTema(actual, todos[actual.id]) === 'en-curso';

  return (
    <Screen>
      <div className={styles.col} style={{ '--mc': colorModulo(m.n) } as CSSProperties}>
        <Link href="/curso" className={styles.back}>← Curso</Link>
        <section className={styles.hero}>
          <span className={styles.kicker}>Módulo {m.n}</span>
          <h1 className={styles.h1}>{m.titulo}</h1>
          <p className={`${styles.muted} ${styles.small}`}>{m.objetivo}</p>
        </section>

        {actual ? (
          actual.leccion ? (
            <Link href={`/tema/${actual.id}`} className={styles.ahora}>
              <span className={styles.etq}>{enCurso ? 'Sigues aquí' : 'Tu siguiente tema'} · {actual.id}</span>
              <h2>{actual.titulo}</h2>
              <p>{actual.pregunta}</p>
              {enCurso && av && <div className={styles.bar}><i style={{ width: `${av.pct}%` }} /></div>}
              <span className={styles.go}>{enCurso ? 'Seguir →' : 'Empezar →'}</span>
            </Link>
          ) : (
            <div className={`${styles.ahora} ${styles.prep}`}>
              <span className={styles.etq}>Lo que sigue · {actual.id}</span>
              <h2>{actual.titulo}</h2>
              <p className={styles.muted}>Estamos preparando este tema. Cuando esté listo, se abre solo.</p>
            </div>
          )
        ) : (
          <div className={styles.ahora}><span className={styles.etq}>Módulo completo</span><h2>¡Terminaste este módulo! 🏆</h2></div>
        )}

        {hechos.length > 0 && (
          <details className={styles.hechos}>
            <summary><span>✓ Ya completaste {hechos.length === 1 ? 'un tema' : `${hechos.length} temas`}</span></summary>
            <ul className={styles.lista}>
              {hechos.map((t) => <li key={t.id}><Link href={`/tema/${t.id}`} className={styles.item}><span className={styles.id}>{t.id}</span><span className={styles.t}>{t.titulo}</span><span className={styles.ok}>✓</span></Link></li>)}
            </ul>
          </details>
        )}

        {proximos.length > 0 && (
          <section className={styles.sigs}>
            <h2 className={styles.h2}>Después</h2>
            {proximos.map((t) => (
              <Link key={t.id} href={`/tema/${t.id}`} className={styles.sig}><span className={styles.id}>{t.id}</span><span className={styles.t}>{t.titulo}</span></Link>
            ))}
            {resto.length > 0 && !verTodo && <button type="button" className={styles.mas} onClick={() => setVerTodo(true)}>Ver el resto del módulo</button>}
            {verTodo && resto.map((t) => (
              <Link key={t.id} href={`/tema/${t.id}`} className={styles.sig}><span className={styles.id}>{t.id}</span><span className={styles.t}>{t.titulo}</span></Link>
            ))}
          </section>
        )}

        {m.proyecto && (
          <details className={styles.proyecto}>
            <summary>🎯 Lo que vas a construir en este módulo</summary>
            <p>{m.proyecto}</p>
          </details>
        )}
      </div>
    </Screen>
  );
}
