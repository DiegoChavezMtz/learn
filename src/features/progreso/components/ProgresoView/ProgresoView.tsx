'use client';
import { useMemo } from 'react';
import { Flame } from '@/components/atoms/Flame';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { progressStore } from '@/lib/progressStore';
import { INTERVALOS } from '@/utils/spacedRepetition';
import { nivel } from '@/utils/xp';
import { estadisticas } from '@/utils/progresoStats';
import styles from './ProgresoView.module.css';

export function ProgresoView() {
  const { listo, todos, dias, racha, hoy, xpTotal } = useProgresoCurso();
  const e = useMemo(
    () => (listo ? estadisticas(todos, Object.keys(todos).flatMap((t) => Object.values(progressStore.registros(t))), dias, hoy) : null),
    [listo, todos, dias, hoy],
  );

  if (!e) return <Screen><h1 className={styles.h1}>Progreso</h1></Screen>;
  const nv = nivel(xpTotal);
  const max = Math.max(1, ...e.cajas);
  const horas = e.minutos >= 60 ? `${Math.floor(e.minutos / 60)} h ${e.minutos % 60} min` : `${e.minutos} min`;

  return (
    <Screen>
      <div className={styles.col}>
        <h1 className={styles.h1}>Progreso</h1>

        <section className={styles.nivel}>
          <span className={styles.n}>{nv.nivel}</span>
          <div className={styles.info}>
            <strong>Nivel {nv.nivel}</strong>
            <div className={styles.track}><div className={styles.fill} style={{ width: `${nv.pct}%` }} /></div>
            <span>{xpTotal} XP · {nv.faltan} para el nivel {nv.nivel + 1}</span>
          </div>
        </section>

        <div className={styles.grid}>
          <div className={styles.stat}><span className={styles.num}><Flame size={22} /> {racha}</span><span className={styles.lbl}>días seguidos</span></div>
          <div className={styles.stat}><span className={styles.num}>{e.mejorRacha}</span><span className={styles.lbl}>mejor racha</span></div>
          <div className={styles.stat}><span className={styles.num}>{e.sesiones}</span><span className={styles.lbl}>sesiones terminadas</span></div>
          <div className={styles.stat}><span className={styles.num}>{horas}</span><span className={styles.lbl}>de estudio registrado</span></div>
        </div>

        <section className={styles.sec}>
          <h2 className={styles.h2}>Últimas 12 semanas</h2>
          <div className={styles.heat} aria-label="Días estudiados">
            {e.mapa.map((d) => <span key={d.f} title={d.f} className={d.on ? styles.on : undefined} />)}
          </div>
          <p className={styles.muted}>{e.diasTotal} {e.diasTotal === 1 ? 'día estudiado' : 'días estudiados'} en total.</p>
        </section>

        <section className={styles.sec}>
          <h2 className={styles.h2}>Tu memoria</h2>
          <p className={styles.muted}>{e.tarjetas} tarjetas en repaso · {e.pendientes} para repasar hoy. Más a la derecha = más tiempo hasta el próximo repaso.</p>
          <div className={styles.cajas}>
            {e.cajas.map((n, i) => (
              <div key={i} className={styles.caja}>
                {n}
                <div className={styles.barra} style={{ height: `${(n / max) * 100}%` }} />
                {INTERVALOS[i]} d
              </div>
            ))}
          </div>
        </section>

        {(e.interes || e.claridad) && (
          <section className={styles.sec}>
            <h2 className={styles.h2}>Cómo te va con el material</h2>
            <p className={styles.muted}>Promedio de lo que calificas al cerrar cada sesión (1 a 5).</p>
            <div className={styles.grid}>
              <div className={styles.stat}><span className={styles.num}>{e.interes ?? '–'}</span><span className={styles.lbl}>interés</span></div>
              <div className={styles.stat}><span className={styles.num}>{e.claridad ?? '–'}</span><span className={styles.lbl}>claridad</span></div>
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}
