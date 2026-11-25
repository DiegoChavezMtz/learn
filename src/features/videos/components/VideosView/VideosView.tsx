'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { useProgresoCurso } from '@/context/ProgresoContext';
import type { VideoItem } from '@/types/videos';
import { etiqueta } from '@/utils/lesson';
import styles from './VideosView.module.css';

/**
 * Videos tipo reels: se desliza hacia arriba, uno por pantalla. Solo aparecen los videos de las sesiones que ya terminaste;
 * al final, el siguiente queda como candado con lo que falta para abrirlo. Un solo reproductor cambia de video, así el sonido
 * que activas una vez se mantiene (iOS exige un toque para activarlo).
 */
export function VideosView({ videos }: { videos: VideoItem[] }) {
  const { todos, listo } = useProgresoCurso();
  const terminada = (v: VideoItem) => !!todos[v.tema]?.sesiones[v.sesionId]?.terminada;
  const abiertos = listo ? videos.filter(terminada) : [];
  const siguiente = listo ? videos.find((v) => !terminada(v)) : undefined;

  const [activo, setActivo] = useState(0);
  const [mudo, setMudo] = useState(true); // el navegador solo deja empezar solo si va sin sonido
  const [pausadoSrc, setPausadoSrc] = useState<string | null>(null);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barraRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const mudoRef = useRef(true);

  const item = abiertos[activo];
  const enCandado = activo >= abiertos.length;
  const nSecciones = abiertos.length + (siguiente ? 1 : 0);

  // Qué reel está en pantalla: el que ocupa más del 60%.
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const io = new IntersectionObserver(
      (es) => { for (const e of es) if (e.isIntersecting && e.intersectionRatio > 0.6) setActivo(Number((e.target as HTMLElement).dataset.i)); },
      { root: feed, threshold: [0.6, 0.9] },
    );
    feed.querySelectorAll('[data-i]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [nSecciones]);

  // Cambia de video en el mismo reproductor.
  const src = item?.src;
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!src) { v.pause(); return; }
    v.src = src;
    v.muted = mudoRef.current;
    v.currentTime = 0;
    void v.play().catch(() => { /* sin autoplay: se reproduce al tocar */ });
  }, [src]);

  if (!listo) return <Screen><p>Cargando…</p></Screen>;

  if (abiertos.length === 0) {
    return (
      <Screen>
        <div className={styles.vacio}>
          <span style={{ fontSize: '3.4rem' }}>🎬</span>
          <h1>Tus videos</h1>
          <p>Aquí verás, uno tras otro, los videos de las sesiones que vayas terminando.</p>
          {siguiente ? (
            <>
              <p>Termina <strong>{siguiente.sesionTitulo}</strong> (tema {siguiente.tema}) para abrir el primero.</p>
              <Button href={`/tema/${siguiente.tema}/sesion/${siguiente.sesionId}`}>Ir a esa sesión</Button>
            </>
          ) : <p>Todavía no hay videos publicados.</p>}
        </div>
      </Screen>
    );
  }

  const pausado = !!src && pausadoSrc === src;
  const alternar = () => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) { void v.play(); setPausadoSrc(null); } else { v.pause(); setPausadoSrc(src); }
  };
  const activarSonido = () => {
    const v = videoRef.current;
    mudoRef.current = !mudo;
    setMudo(!mudo);
    if (v) { v.muted = !mudo; if (v.paused && src && !pausado) void v.play(); } // dentro del toque: iOS lo permite
  };
  const alTerminar = () => {
    const v = videoRef.current;
    if (activo < abiertos.length - 1 || siguiente) {
      feedRef.current?.querySelector<HTMLElement>(`[data-i="${activo + 1}"]`)?.scrollIntoView({ behavior: 'smooth' });
    } else if (v) { v.currentTime = 0; void v.play(); }
  };

  return (
    <>
      <video
        ref={videoRef} className={clsx(styles.video, enCandado && styles.oculto)} playsInline muted preload="auto"
        onTimeUpdate={(e) => { const t = e.currentTarget; const b = barraRef.current?.firstElementChild as HTMLElement | null; if (b && t.duration) b.style.width = `${(t.currentTime / t.duration) * 100}%`; }}
        onEnded={alTerminar} onError={() => src && setErrorSrc(src)} onLoadedData={() => setErrorSrc(null)}
      />
      {!enCandado && <section ref={barraRef} className={styles.barra} aria-hidden="true"><i /></section>}

      <div ref={feedRef} className={styles.feed}>
        {abiertos.map((v, i) => (
          <section key={v.video} data-i={i} className={styles.reel} onClick={alternar} aria-label={`Video ${v.video}: ${v.titulo}`}>
            <div className={styles.arriba}>
              <div className={styles.titulo}><span className={styles.chip}>{v.video} · Tema {v.tema}</span><h2>{v.titulo}</h2></div>
              <span className={styles.cuenta}>{i + 1}/{abiertos.length}</span>
            </div>
            {i === activo && mudo && <button type="button" className={styles.sonido} onClick={(e) => { e.stopPropagation(); activarSonido(); }}>🔇 Toca para activar el sonido</button>}
            {i === activo && pausado && <span className={styles.play} aria-hidden="true">▶</span>}
            {i === activo && errorSrc === v.src && <div className={styles.error}>El video no se pudo cargar. Revisa tu conexión y desliza para seguir.</div>}
            <div className={styles.lado}>
              <button type="button" className={styles.boton} aria-label={mudo ? 'Activar sonido' : 'Silenciar'} onClick={(e) => { e.stopPropagation(); activarSonido(); }}>{mudo ? '🔇' : '🔊'}</button>
            </div>
            <div className={styles.info}>
              <Link href={`/tema/${v.tema}/sesion/${v.sesionId}`} className={styles.ir} onClick={(e) => e.stopPropagation()}>Ir a la lección ({etiqueta(v.sesionId)}) ›</Link>
            </div>
          </section>
        ))}
        {siguiente && (
          <section data-i={abiertos.length} className={clsx(styles.reel, styles.candado)}>
            <span className={styles.cand}>🔒</span>
            <h2>Siguiente video: {siguiente.titulo}</h2>
            <p>Se desbloquea al terminar <strong>{siguiente.sesionTitulo}</strong> (tema {siguiente.tema}).</p>
            <Button href={`/tema/${siguiente.tema}/sesion/${siguiente.sesionId}`}>Ir a esa sesión</Button>
          </section>
        )}
      </div>
    </>
  );
}
