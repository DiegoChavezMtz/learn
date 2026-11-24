'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { Flame } from '@/components/atoms/Flame';
import { Screen } from '@/components/atoms/Screen';
import { AccountLink } from '@/components/molecules/AccountLink';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useOfflineWarm } from '@/hooks/useOfflineWarm';
import type { Curso, ModuloCurso } from '@/types/curso';
import { avanceModulo, colorModulo, estadoTema, moduloDeTema, siguientePaso } from '@/utils/curso';
import { rutasOffline } from '@/utils/offline';
import { nivel } from '@/utils/xp';
import styles from './CursoView.module.css';

const SEP = 112;          // separación vertical entre nodos
const TARJETA = 214;      // espacio extra que ocupa la tarjeta del tema actual
const x = (i: number) => 50 + 25 * Math.sin(i * 1.15);

function Banda({ m, todos }: { m: ModuloCurso; todos: Parameters<typeof avanceModulo>[1] }) {
  const a = avanceModulo(m, todos);
  const pronto = a.disponibles === 0;
  return (
    <Link href={`/curso/${m.n}`} className={clsx(styles.banda, pronto && styles.pronto)} style={{ '--mc': colorModulo(m.n) } as CSSProperties}>
      <span className={styles.n}>{pronto ? '🔒' : a.hechos === a.disponibles ? '✓' : m.n}</span>
      <span className={styles.t}>{m.titulo}</span>
      <span className={styles.e}>{pronto ? 'pronto' : a.hechos === a.disponibles ? 'completo' : 'abierto'}</span>
    </Link>
  );
}

/** Pantalla de inicio: el curso como un mapa que arranca en donde vas. El tema actual lleva directo a su siguiente paso. */
export function CursoView({ curso }: { curso: Curso }) {
  const { todos, listo, xpTotal, racha } = useProgresoCurso();
  const [aviso, setAviso] = useState('');
  const actualRef = useRef<HTMLDivElement>(null);
  useOfflineWarm(rutasOffline(curso), []);

  const paso = listo ? siguientePaso(curso, todos) : null;
  const nActual = paso ? moduloDeTema(paso.tema.id) : curso.modulos.find((m) => m.temas.some((t) => t.leccion))?.n ?? 1;
  const modulo = curso.modulos.find((m) => m.n === nActual) ?? curso.modulos[0];
  const antes = curso.modulos.filter((m) => m.n < modulo.n);
  const despues = curso.modulos.filter((m) => m.n > modulo.n);
  const nv = nivel(xpTotal);

  // Posiciones de los nodos del módulo actual
  const iActual = paso ? modulo.temas.findIndex((t) => t.id === paso.tema.id) : -1;
  const ys = modulo.temas.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 56 : acc[i - 1] + SEP + (i - 1 === iActual ? TARJETA : 0));
    return acc;
  }, []);
  const nodos = modulo.temas.map((t, i) => ({ t, i, x: x(i), y: ys[i] }));
  const alto = ys[ys.length - 1] + 70 + (ys.length - 1 === iActual ? TARJETA : 0);
  const trazo = (a: (typeof nodos)[number], b: (typeof nodos)[number]) => {
    const dy = (b.y - a.y) * 0.5;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  };
  const hecho = nodos.slice(0, Math.max(iActual, 0)).slice(1).map((n, k) => trazo(nodos[k], n)).join(' ');
  const pendiente = nodos.slice(Math.max(iActual, 0) + 1).map((n, k) => trazo(nodos[Math.max(iActual, 0) + k], n)).join(' ');
  const completo = listo && !paso && modulo.temas.some((t) => t.leccion);

  // Al abrir, el mapa se coloca en tu posición.
  useEffect(() => {
    if (listo) actualRef.current?.scrollIntoView({ block: 'center' });
  }, [listo]);

  const dondeVoy = () => actualRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const avisar = (m: string) => { setAviso(m); setTimeout(() => setAviso(''), 2200); };

  return (
    <Screen>
      <div className={styles.col}>
        <div className={styles.top}>
          <div className={styles.pills}>
            <span className={styles.pill} aria-label={`Nivel ${nv.nivel}`}>⚡ {nv.nivel}</span>
            <span className={styles.pill} aria-label="Racha"><Flame size={18} />{racha}</span>
          </div>
          <div className={styles.acciones}>
            {paso && <button type="button" className={styles.loc} onClick={dondeVoy}>📍 Dónde voy</button>}
            <AccountLink />
          </div>
        </div>

        {antes.map((m) => <Banda key={m.n} m={m} todos={todos} />)}

        <Link href={`/curso/${modulo.n}`} className={styles.zona} style={{ '--mc': colorModulo(modulo.n) } as CSSProperties}>
          <span><span className={styles.k}>Módulo {modulo.n}</span><h2>{modulo.titulo}</h2></span>
          <span className={styles.ver}>Ver módulo ›</span>
        </Link>

        <div className={styles.mapa} style={{ height: alto }}>
          <svg viewBox={`0 0 100 ${alto}`} preserveAspectRatio="none" aria-hidden="true">
            {pendiente && <path d={pendiente} fill="none" stroke="var(--line)" strokeWidth="5" strokeDasharray="1 11" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
            {hecho && <path d={hecho} fill="none" stroke="var(--g2)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
            {iActual > 0 && <path d={trazo(nodos[iActual - 1], nodos[iActual])} fill="none" stroke="var(--g2)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          </svg>

          {nodos.map(({ t, i, x: nx, y: ny }) => {
            const estado = estadoTema(t, todos[t.id]);
            const actual = i === iActual;
            const cercano = iActual >= 0 && i > iActual && i <= iActual + 2;
            const cls = clsx(styles.nodo, actual ? styles.actual : estado === 'hecho' ? styles.hecho : estado === 'pronto' ? styles.pronto : styles.disp);
            const pos = { left: `${nx}%`, top: ny } as CSSProperties;
            const cuerpo = (
              <>
                <span className={styles.circ}>{estado === 'hecho' && !actual ? '✓' : estado === 'pronto' ? '🔒' : actual ? '▶' : t.n}</span>
                <span className={styles.cap}><b>{t.id}</b>{cercano ? t.titulo : ''}</span>
              </>
            );
            if (estado === 'pronto') return <button key={t.id} type="button" className={cls} style={pos} onClick={() => avisar('Este tema se abre cuando se publique')} aria-label={`Tema ${t.id}, próximamente`}>{cuerpo}</button>;
            return <Link key={t.id} href={actual && paso ? `/tema/${t.id}/sesion/${paso.sesion.id}` : `/tema/${t.id}`} className={cls} style={pos} aria-label={`Tema ${t.id}: ${t.titulo}`}>{cuerpo}</Link>;
          })}

          {paso && iActual >= 0 && (
            <>
              <div ref={actualRef} style={{ position: 'absolute', top: nodos[iActual].y, left: 0, width: 1, height: 1 }} />
              <div className={styles.tarjeta} style={{ top: nodos[iActual].y + 62 }}>
                <span className={styles.k}>{todos[paso.tema.id]?.sesiones && Object.keys(todos[paso.tema.id].sesiones).length ? 'Estás aquí' : 'Empieza aquí'} · {paso.tema.id}</span>
                <h3>{paso.tema.titulo}</h3>
                <p className={styles.paso}>Siguiente paso: <strong>{paso.sesion.titulo}</strong> · {paso.sesion.minutos} min</p>
                <Button href={`/tema/${paso.tema.id}/sesion/${paso.sesion.id}`}>{Object.keys(todos[paso.tema.id]?.sesiones ?? {}).length ? 'Seguir' : 'Empezar'}</Button>
                <Link href={`/tema/${paso.tema.id}`} className={styles.link}>Ver el tema</Link>
              </div>
            </>
          )}
        </div>

        {completo && <div className={styles.fin}>¡Llegaste al final de lo publicado! 🏆<br /><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Se abren más pasos conforme llegue contenido.</span></div>}

        {despues.slice(0, 2).map((m) => <Banda key={m.n} m={m} todos={todos} />)}
        {despues.length > 2 && (
          <details className={styles.mas}>
            <summary>Más adelante</summary>
            <div className={styles.lista}>{despues.slice(2).map((m) => <Banda key={m.n} m={m} todos={todos} />)}</div>
          </details>
        )}
      </div>
      {aviso && <div className={styles.aviso} role="status">{aviso}</div>}
    </Screen>
  );
}
