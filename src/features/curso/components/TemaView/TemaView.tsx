'use client';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useOfflineWarm } from '@/hooks/useOfflineWarm';
import type { ModuloCurso, TemaCurso } from '@/types/curso';
import { avanceTema, colorModulo, estadoTema } from '@/utils/curso';
import { enfocar } from '@/utils/enfoque';
import { etiqueta, pasoColor } from '@/utils/lesson';
import { vencidos } from '@/utils/spacedRepetition';
import styles from './TemaView.module.css';

type Props = { tema: TemaCurso; modulo: ModuloCurso; anterior?: TemaCurso; siguiente?: TemaCurso; hayLibro: boolean; videos: string[] };

/** Tema en modo enfoque: tu paso actual en grande, lo hecho plegado y solo los 2 pasos que siguen. Sin totales que abrumen. */
export function TemaView({ tema: t, modulo, anterior, siguiente, hayLibro, videos }: Props) {
  const { todos, hoy, listo } = useProgresoCurso();
  useOfflineWarm([], videos); // los videos de este tema quedan guardados para verlos sin conexión
  const p = listo ? todos[t.id] : undefined;
  const av = avanceTema(t, p);
  const estado = estadoTema(t, p);
  const nRepasos = p ? vencidos(p.repaso, hoy).length : 0;
  const { hechos, actual, proximos } = enfocar(t.leccion?.sesiones ?? [], (s) => !!p?.sesiones[s.id]?.terminada);

  return (
    <Screen>
      <div className={styles.col} style={{ '--mc': colorModulo(modulo.n) } as CSSProperties}>
        <Link href={`/curso/${modulo.n}`} className={styles.back}>← {modulo.titulo}</Link>

        <section className={`${styles.hero} ${t.leccion ? '' : styles.prep}`}>
          <span className={styles.kicker}>Tema {t.id}</span>
          <h1 className={styles.h1}>{t.titulo}</h1>
          <p className={styles.preg}>{t.pregunta}</p>
          {t.leccion ? (
            <>
              {hechos.length > 0 && <div className={styles.bar} role="progressbar" aria-valuenow={av.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del tema"><i style={{ width: `${av.pct}%` }} /></div>}
              {actual ? (
                <>
                  <div className={styles.paso}>
                    <span>{hechos.length ? 'Tu siguiente paso' : 'Empieza aquí'}</span>
                    <strong>{actual.titulo}</strong>
                    <span>{actual.paso} · {actual.minutos} min</span>
                  </div>
                  <Button variant="light" href={`/tema/${t.id}/sesion/${actual.id}`}>{hechos.length ? 'Seguir' : 'Empezar'}</Button>
                </>
              ) : (
                <div className={styles.paso}><strong>¡Tema completado! 🏆</strong><span>Repásalo cuando quieras; tus repasos volverán solos.</span></div>
              )}
              {nRepasos > 0 && <Button variant="ghost" small href={`/tema/${t.id}/repaso`}>Repasos de hoy ({nRepasos})</Button>}
              {hechos.length > 0 && <Button variant="ghost" small href={`/tema/${t.id}/repasar`}>Practicar lo que ya viste</Button>}
            </>
          ) : (
            <p className={styles.preg}>Estamos preparando este tema. Cuando esté listo, se abre solo.</p>
          )}
        </section>

        {hechos.length > 0 && (
          <details className={styles.hechas}>
            <summary><span>✓ {hechos.length === 1 ? 'Completaste un paso' : `Completaste ${hechos.length} pasos`}</span></summary>
            <ul className={styles.lista}>
              {hechos.map((s) => <li key={s.id}><Link href={`/tema/${t.id}/sesion/${s.id}`} className={styles.item}><span className={styles.t}>{s.titulo}</span><span className={styles.ok}>✓</span></Link></li>)}
            </ul>
          </details>
        )}

        {proximos.length > 0 && (
          <section className={styles.sigs}>
            <h2 className={styles.h2}>Después</h2>
            {proximos.map((s) => (
              <Link key={s.id} href={`/tema/${t.id}/sesion/${s.id}`} className={styles.sig} style={{ '--pc': pasoColor[s.paso] } as CSSProperties}>
                <span className={styles.dot} />
                <span className={styles.stxt}><span className={styles.stitulo}>{s.titulo}</span><span className={styles.smeta}>{etiqueta(s.id)} · {s.paso} · {s.minutos} min</span></span>
              </Link>
            ))}
          </section>
        )}

        {t.practica && (
          <details className={styles.detalle}>
            <summary>🎯 Lo que vas a lograr</summary>
            <p>{t.practica}</p>
          </details>
        )}
        {t.leccion && hayLibro && estado !== 'pronto' && <Button variant="ghost" small href={`/tema/${t.id}/libro`}>Leer el tema completo</Button>}

        <nav className={styles.nav} aria-label="Temas">
          {anterior && <Link href={`/tema/${anterior.id}`}>← {anterior.id}</Link>}
          {siguiente && <Link href={`/tema/${siguiente.id}`} className={styles.der}>{siguiente.id} →</Link>}
        </nav>
      </div>
    </Screen>
  );
}
