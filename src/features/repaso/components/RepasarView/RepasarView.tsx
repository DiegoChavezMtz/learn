'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { Player } from '@/components/organisms/Player';
import { useProgreso } from '@/context/ProgresoContext';
import { TemaProvider } from '@/context/TemaContext';
import type { ItemTarjeta, Leccion } from '@/types/lesson';
import type { StatsSesion } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';
import { etiqueta } from '@/utils/lesson';
import { debiles, rondaLibre, vistas } from '@/utils/repasar';
import styles from './RepasarView.module.css';

type Ronda = { nombre: string; ids: string[]; alAzar: boolean; items: ItemTarjeta[]; k: number };

function Contenido({ leccion, evaluar }: { leccion: Leccion; evaluar?: Evaluador }) {
  const { listo, progreso, marcarDia } = useProgreso();
  const [ronda, setRonda] = useState<Ronda | null>(null);
  const [fin, setFin] = useState<StatsSesion | null>(null);

  if (!listo) return <Screen sinTabs><p>Cargando…</p></Screen>;
  const deb = debiles(leccion, progreso.repaso);
  const todas = vistas(leccion, progreso.repaso);
  const porSesion = leccion.sesiones.map((s) => ({ s, n: vistas(leccion, progreso.repaso, s.id).length })).filter((x) => x.n > 0);

  const empezar = (nombre: string, ids: string[], alAzar: boolean) => {
    setFin(null);
    setRonda({ nombre, ids, alAzar, items: rondaLibre(leccion, ids, alAzar), k: (ronda?.k ?? 0) + 1 });
  };

  if (ronda && fin) {
    return (
      <Screen sinTabs>
        <div className={styles.fin}>
          <span className={styles.etq}>Práctica terminada · {ronda.nombre}</span>
          <div className={styles.big}>{fin.aciertos}/{fin.total}</div>
          <h2>{fin.total === 0 || fin.aciertos === fin.total ? 'Todo en su lugar' : 'Buen repaso: sigue practicando lo que falló'}</h2>
          <p>Esta práctica no cambia tus fechas de repaso.</p>
          <div className={styles.acc}>
            <Button variant="light" onClick={() => empezar(ronda.nombre, ronda.ids, ronda.alAzar)}>Otra ronda</Button>
            <Button variant="ghost" onClick={() => { setRonda(null); setFin(null); }}>Volver a Practicar</Button>
          </div>
        </div>
      </Screen>
    );
  }
  if (ronda) {
    return (
      <Screen sinTabs>
        <Player key={ronda.k} items={ronda.items} evaluar={evaluar} onExit={() => setRonda(null)} onFinish={(s) => { marcarDia(); setFin({ ...s, texto: { ...s.texto } }); }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <div className={styles.col}>
        <Link href={`/tema/${leccion.tema}`} className={styles.back}>← Tema {leccion.tema}</Link>
        <h1 className={styles.h1}>Practicar</h1>
        <p className={`${styles.muted} ${styles.small}`}>Practica cuando quieras. <strong>No cambia tus fechas de repaso</strong>: eso solo pasa con los repasos de Hoy.</p>

        <section className={styles.debiles}>
          <span className={styles.etq}>Tus puntos débiles</span>
          <div className={styles.num}>{deb.length}<small>{deb.length === 1 ? 'tarjeta' : 'tarjetas'}</small></div>
          <p>Lo que más has fallado o te salió con huecos.</p>
          <Button variant="light" disabled={!deb.length} onClick={() => empezar('Puntos débiles', deb, false)}>{deb.length ? 'Practicar mis puntos débiles' : 'Aún no tienes puntos débiles'}</Button>
        </section>

        <section className={styles.lista}>
          <h2 className={styles.h2}>Por sesión</h2>
          {todas.length > 0 ? (
            <button type="button" className={styles.fila} onClick={() => empezar('Todo el tema', todas, true)}>
              <span><strong>Todo</strong>el tema · 12 al azar</span><span className={styles.cuenta}>{todas.length} vistas</span>
            </button>
          ) : (
            <p className={`${styles.muted} ${styles.small}`}>Cuando termines una sesión, sus preguntas aparecen aquí.</p>
          )}
          {porSesion.map(({ s, n }) => (
            <button key={s.id} type="button" className={styles.fila} onClick={() => empezar(s.titulo, vistas(leccion, progreso.repaso, s.id), true)}>
              <span><strong>{etiqueta(s.id)}</strong>{s.titulo}</span><span className={styles.cuenta}>{n}</span>
            </button>
          ))}
        </section>
      </div>
    </Screen>
  );
}

export function RepasarView(props: { leccion: Leccion; evaluar?: Evaluador }) {
  return <TemaProvider tema={props.leccion.tema} libre><Contenido {...props} /></TemaProvider>;
}
