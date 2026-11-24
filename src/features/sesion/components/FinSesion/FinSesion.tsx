'use client';
import { useState, type CSSProperties } from 'react';
import { Button } from '@/components/atoms/Button';
import { Flame } from '@/components/atoms/Flame';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { useProgreso, useProgresoCurso } from '@/context/ProgresoContext';
import type { Sesion } from '@/types/lesson';
import type { StatsSesion } from '@/types/progreso';
import { nivel, XP } from '@/utils/xp';
import styles from './FinSesion.module.css';

type Camino = { antes: number; despues: number; total: number; siguiente?: { id: string; titulo: string; minutos: number }; tema: string };
type Props = {
  sesion: Sesion; stats: StatsSesion; minutos: number; camino: Camino;
  onGuardar: (r: { interes: number | null; claridad: number | null; nota: string }, destino: 'siguiente' | 'hoy') => void;
};

const COLORES = ['#ffa24a', '#ff4d6d', '#c026d3', '#ffd166', '#fff'];
const CONFETI = [...Array(26)].map((_, i) => ({ x: `${(i * 37) % 100}%`, d: `${1.6 + ((i * 7) % 10) / 8}s`, delay: `${((i * 13) % 12) / 10}s`, c: COLORES[i % COLORES.length] }));

function Escala({ pregunta, caras, bajo, alto, valor, onPick }: { pregunta: string; caras: string[]; bajo: string; alto: string; valor: number | null; onPick: (n: number) => void }) {
  return (
    <div className={styles.fila}>
      <span className={styles.pregunta}>{pregunta}</span>
      <div className={styles.scale}>
        {caras.map((c, i) => <button key={i} type="button" className={styles.opt} aria-pressed={valor === i + 1} aria-label={`${i + 1} de 5`} onClick={() => onPick(i + 1)}>{c}</button>)}
      </div>
      <div className={styles.ends}><span>{bajo}</span><span>{alto}</span></div>
    </div>
  );
}

/** Cierre de sesión: celebración (XP, racha, nivel) y, al final, interés y claridad para el registro C3. */
export function FinSesion({ sesion, stats, minutos, camino, onGuardar }: Props) {
  const { racha, hoy, xpTotal } = useProgresoCurso();
  const { progreso } = useProgreso();
  const [interes, setInteres] = useState<number | null>(null);
  const [claridad, setClaridad] = useState<number | null>(null);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const pct = stats.total ? Math.round((stats.aciertos / stats.total) * 100) : null;
  // Los puntos de cada respuesta ya están sumados; al guardar se suman los de terminar la sesión.
  const xpSesion = stats.xp + XP.sesion;
  const nv = nivel(xpTotal + XP.sesion);
  const rachaHoy = progreso.dias.includes(hoy) ? racha : racha + 1;
  const completo = camino.despues >= camino.total;
  const de = camino.total ? (camino.antes / camino.total) * 100 : 0, a = camino.total ? (camino.despues / camino.total) * 100 : 0;
  const titulo = completo ? '¡Terminaste este tema!' : pct === null ? '¡Sesión completa!' : pct >= 80 ? '¡Lo dominaste!' : pct >= 50 ? '¡Vas muy bien!' : 'Buen intento: mañana lo repasamos';

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.confeti} aria-hidden="true">
          {CONFETI.map((c, i) => <i key={i} style={{ '--x': c.x, '--d': c.d, '--delay': c.delay, '--c': c.c } as CSSProperties} />)}
        </div>
        <span className={styles.emoji}>{completo ? '🏆' : pct === null || pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '🌱'}</span>
        <h1 className={styles.titulo}>{titulo}</h1>
        <p className={styles.sub}>{sesion.titulo}</p>
        <div className={styles.xp}>+{xpSesion}<small>XP</small></div>
        <div className={styles.chips}>
          <span className={styles.chip}><Flame size={18} /> {rachaHoy} {rachaHoy === 1 ? 'día' : 'días'}</span>
          {pct !== null && <span className={styles.chip}>🎯 {stats.aciertos}/{stats.total}</span>}
          <span className={styles.chip}>⏱ {minutos} min</span>
          {stats.mini && <span className={styles.chip}>{stats.mini === 'ok' ? '✅' : stats.mini === 'huecos' ? '🟡' : '❌'} explicación</span>}
        </div>
      </section>

      <section className={styles.camino}>
        <div className={styles.row}><strong>{camino.despues > camino.antes ? `¡Paso ${camino.despues} completado!` : 'Paso repasado'}</strong><span className={styles.muted}>{camino.despues > camino.antes ? '+1 en tu camino' : ''}</span></div>
        <div className={styles.pista} style={{ '--de': `${de}%`, '--a': `${a}%` } as CSSProperties}><i /></div>
        {completo ? (
          <p className={styles.muted}>Llegaste al final de lo publicado en este tema. Tus repasos seguirán apareciendo en Hoy.</p>
        ) : camino.siguiente && (
          <p className={styles.muted}>Sigue: <strong>{camino.siguiente.titulo}</strong> · {camino.siguiente.minutos} min</p>
        )}
      </section>

      <section className={styles.nivel}>
        <div className={styles.row}><span>Nivel {nv.nivel}</span><span className={styles.muted}>{nv.faltan} XP para el {nv.nivel + 1}</span></div>
        <ProgressBar value={nv.pct} label="Avance de nivel" />
        {stats.total > 0 && <p className={styles.muted}>Las preguntas de hoy entran a tu repaso: vuelven en 1, 3, 7 y 14 días; las que fallaste, mañana.</p>}
      </section>

      <section className={styles.rate}>
        <h2>Dos segundos: ¿cómo estuvo?</h2>
        <Escala pregunta="Interés" caras={['😴', '😐', '🙂', '😃', '🤩']} bajo="Aburrido" alto="Me enganchó" valor={interes} onPick={setInteres} />
        <Escala pregunta="Claridad" caras={['😵', '🤔', '😐', '🙂', '💡']} bajo="Confuso" alto="Clarísimo" valor={claridad} onPick={setClaridad} />
        <textarea className={styles.textarea} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Opcional: ¿qué te gustó o qué estorbó?" />
      </section>

      <div className={styles.actions}>
        {(() => {
          const guardar = (d: 'siguiente' | 'hoy') => { setGuardando(true); onGuardar({ interes, claridad, nota: nota.trim() }, d); };
          return camino.siguiente && !completo ? (
            <>
              <Button disabled={guardando} onClick={() => guardar('siguiente')}>Seguir con el siguiente paso</Button>
              <Button variant="ghost" disabled={guardando} onClick={() => guardar('hoy')}>Terminar por hoy</Button>
            </>
          ) : <Button disabled={guardando} onClick={() => guardar('hoy')}>Guardar y volver</Button>;
        })()}
      </div>
    </div>
  );
}
