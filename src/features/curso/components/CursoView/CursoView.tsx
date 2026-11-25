'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { Flame } from '@/components/atoms/Flame';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useOfflineWarm } from '@/hooks/useOfflineWarm';
import type { Curso, ModuloCurso, TemaCurso } from '@/types/curso';
import { avanceModulo, colorModulo, estadoTema, moduloDeTema, siguientePaso } from '@/utils/curso';
import { rutasOffline } from '@/utils/offline';
import { nivel } from '@/utils/xp';
import styles from './CursoView.module.css';

const SEP = 112;          // separación vertical entre nodos
const TARJETA = 214;      // espacio extra que ocupa la tarjeta del tema actual
const ZONA = 88;          // alto de la franja de cada módulo
const x = (i: number) => 50 + 25 * Math.sin(i * 1.15);

type Item =
  | { k: 'zona'; m: ModuloCurso; y: number }
  | { k: 'nodo'; t: TemaCurso; m: ModuloCurso; j: number; x: number; y: number };

function Banda({ m, todos, onBloqueado }: { m: ModuloCurso; todos: Parameters<typeof avanceModulo>[1]; onBloqueado: (msg: string) => void }) {
  const a = avanceModulo(m, todos);
  const pronto = a.disponibles === 0;
  return (
    <button type="button" className={clsx(styles.banda, styles.pronto)} style={{ '--mc': colorModulo(m.n) } as CSSProperties} onClick={() => onBloqueado(pronto ? 'Este módulo se abre cuando se publique' : 'Se abre cuando llegues a este módulo')}>
      <span className={styles.n}>🔒</span>
      <span className={styles.t}>{m.titulo}</span>
      <span className={styles.e}>{pronto ? 'pronto' : 'más adelante'}</span>
    </button>
  );
}

/**
 * Pantalla de inicio: el curso como un solo mapa que arranca donde vas.
 * Hacia atrás todo está abierto (módulos y temas ya hechos, para volver a ellos); hacia adelante, bloqueado.
 */
export function CursoView({ curso }: { curso: Curso }) {
  const { todos, listo, xpTotal, racha } = useProgresoCurso();
  const [aviso, setAviso] = useState('');
  const anclaRef = useRef<HTMLDivElement>(null);
  useOfflineWarm(rutasOffline(curso), []);

  const paso = listo ? siguientePaso(curso, todos) : null;
  // Módulo actual: el del siguiente paso; si ya se terminó todo lo publicado, el último que tiene contenido.
  const conContenido = curso.modulos.filter((m) => m.temas.some((t) => t.leccion));
  const nActual = paso ? moduloDeTema(paso.tema.id) : (conContenido[conContenido.length - 1]?.n ?? 1);
  const hasta = curso.modulos.filter((m) => m.n <= nActual);       // se dibujan completos
  const despues = curso.modulos.filter((m) => m.n > nActual);      // bloqueados
  const nv = nivel(xpTotal);

  // Un solo camino con todos los módulos hasta el actual. Las posiciones se calculan sin reasignar variables.
  const items = hasta.reduce<{ lista: Item[]; y: number; j: number }>((acc, m) => {
    let { y, j } = acc;
    const lista = [...acc.lista, { k: 'zona', m, y } as Item];
    y += ZONA;
    for (const t of m.temas) {
      lista.push({ k: 'nodo', t, m, j, x: x(j), y: y + 46 });
      y += SEP + (paso?.tema.id === t.id ? TARJETA : 0);
      j++;
    }
    return { lista, y, j };
  }, { lista: [], y: 8, j: 0 });
  const nodos = items.lista.filter((i): i is Extract<Item, { k: 'nodo' }> => i.k === 'nodo');
  const alto = items.y + 24;

  const iActual = paso ? nodos.findIndex((n) => n.t.id === paso.tema.id) : -1;
  // Si no hay un tema "actual" (todo lo publicado está hecho), el ancla es el último tema hecho.
  const iAncla = iActual >= 0 ? iActual : nodos.reduce((u, n, i) => (estadoTema(n.t, todos[n.t.id]) === 'hecho' ? i : u), -1);
  const iCorte = iActual >= 0 ? iActual : iAncla;
  const trazo = (a: (typeof nodos)[number], b: (typeof nodos)[number]) => {
    const dy = (b.y - a.y) * 0.5;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  };
  const tramos = nodos.slice(1).map((b, k) => ({ d: trazo(nodos[k], b), hecho: k + 1 <= iCorte }));
  const completo = listo && !paso && conContenido.length > 0;

  // Al abrir, el mapa se coloca en tu posición.
  useEffect(() => {
    if (listo) anclaRef.current?.scrollIntoView({ block: 'center' });
  }, [listo]);

  const dondeVoy = () => anclaRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const avisar = (m: string) => { setAviso(m); setTimeout(() => setAviso(''), 2400); };
  const queFalta = paso ? `Primero termina el tema ${paso.tema.id}` : 'Se abre cuando se publique';

  return (
    <Screen>
      <div className={styles.col}>
        <div className={styles.top}>
          <div className={styles.pills}>
            <span className={styles.pill} aria-label={`Nivel ${nv.nivel}`}>⚡ {nv.nivel}</span>
            <span className={styles.pill} aria-label="Racha"><Flame size={18} />{racha}</span>
          </div>
          <div className={styles.acciones}>
            {iAncla >= 0 && <button type="button" className={styles.loc} onClick={dondeVoy}>📍 Dónde voy</button>}
          </div>
        </div>

        <div className={styles.mapa} style={{ height: alto }}>
          <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
            {tramos.filter((t) => !t.hecho).map((t, i) => <path key={`p${i}`} d={t.d} fill="none" stroke="var(--line)" strokeWidth="5" strokeDasharray="1 11" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
            {tramos.filter((t) => t.hecho).map((t, i) => <path key={`h${i}`} d={t.d} fill="none" stroke="var(--g2)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
          </svg>

          {items.lista.map((it) => {
            if (it.k === 'zona') {
              const a = avanceModulo(it.m, todos);
              return (
                <Link key={`z${it.m.n}`} href={`/curso/${it.m.n}`} className={styles.zona} style={{ top: it.y, '--mc': colorModulo(it.m.n) } as CSSProperties}>
                  <span><span className={styles.k}>Módulo {it.m.n}{a.disponibles > 0 && a.hechos === a.disponibles ? ' · ✓ completo' : ''}</span><h2>{it.m.titulo}</h2></span>
                  <span className={styles.ver}>Ver ›</span>
                </Link>
              );
            }
            const { t, j, x: nx, y: ny } = it;
            const estado = estadoTema(t, todos[t.id]);
            const actual = j === iActual;
            const abierto = actual || estado === 'hecho'; // hacia atrás, abierto; hacia adelante, bloqueado
            const cercano = iActual >= 0 && j > iActual && j <= iActual + 2;
            const cls = clsx(styles.nodo, actual ? styles.actual : estado === 'hecho' ? styles.hecho : styles.pronto, nx >= 50 && styles.izq);
            const pos = { left: `${nx}%`, top: ny } as CSSProperties;
            const cuerpo = (
              <>
                <span className={styles.circ}>{actual ? '▶' : estado === 'hecho' ? '✓' : '🔒'}</span>
                <span className={styles.cap}><b>{t.id}</b>{cercano || (estado === 'hecho' && !actual) ? t.titulo : ''}</span>
              </>
            );
            const ancla = j === iAncla ? <div ref={anclaRef} style={{ position: 'absolute', top: ny, left: 0, width: 1, height: 1 }} /> : null;
            return (
              <div key={t.id}>
                {ancla}
                {abierto ? (
                  <Link href={actual && paso ? `/tema/${t.id}/sesion/${paso.sesion.id}` : `/tema/${t.id}`} className={cls} style={pos} aria-label={`Tema ${t.id}: ${t.titulo}${estado === 'hecho' ? ', completado' : ''}`}>{cuerpo}</Link>
                ) : (
                  <button type="button" className={cls} style={pos} onClick={() => avisar(t.leccion ? queFalta : 'Se abre cuando se publique')} aria-label={`Tema ${t.id}, bloqueado`}>{cuerpo}</button>
                )}
                {actual && paso && (
                  <div className={styles.tarjeta} style={{ top: ny + 62 }}>
                    <span className={styles.k}>{Object.keys(todos[paso.tema.id]?.sesiones ?? {}).length ? 'Estás aquí' : 'Empieza aquí'} · {paso.tema.id}</span>
                    <h3>{paso.tema.titulo}</h3>
                    <p className={styles.paso}>Siguiente paso: <strong>{paso.sesion.titulo}</strong> · {paso.sesion.minutos} min</p>
                    <Button href={`/tema/${paso.tema.id}/sesion/${paso.sesion.id}`}>{Object.keys(todos[paso.tema.id]?.sesiones ?? {}).length ? 'Seguir' : 'Empezar'}</Button>
                    <Link href={`/tema/${paso.tema.id}`} className={styles.link}>Ver el tema</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {completo && <div className={styles.fin}>¡Llegaste al final de lo publicado! 🏆<br /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Se abren más pasos conforme llegue contenido. Lo que ya hiciste sigue abierto: sube por el mapa.</span></div>}

        {despues.slice(0, 2).map((m) => <Banda key={m.n} m={m} todos={todos} onBloqueado={avisar} />)}
        {despues.length > 2 && (
          <details className={styles.mas}>
            <summary>Más adelante</summary>
            <div className={styles.lista}>{despues.slice(2).map((m) => <Banda key={m.n} m={m} todos={todos} onBloqueado={avisar} />)}</div>
          </details>
        )}
      </div>
      {aviso && <div className={styles.aviso} role="status">{aviso}</div>}
    </Screen>
  );
}
