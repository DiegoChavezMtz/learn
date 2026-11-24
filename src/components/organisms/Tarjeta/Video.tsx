'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Tarjeta } from '@/types/lesson';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Video({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'video' }>>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [fallo, setFallo] = useState(false);
  const continuar = () => {
    const v = ref.current;
    v?.pause();
    stats.guardarTexto(c.id, `visto ${Math.round(v?.currentTime ?? 0)} s`);
    onNext();
  };
  return (
    <>
      <span className={styles.kicker}>{kicker} · video de 1 minuto</span>
      <h2>{c.titulo}</h2>
      <video ref={ref} className={styles.video} src={c.src} controls playsInline preload="metadata" crossOrigin="anonymous" onError={() => setFallo(true)}>
        {c.subs && <track kind="subtitles" srcLang="es" label="Español" src={c.subs} default />}
      </video>
      {fallo && <p className={`${styles.note} ${styles.err}`}>El video no se pudo cargar. Puedes continuar sin él.</p>}
      <p className={`${styles.muted} ${styles.small}`}>Míralo con atención: justo después vas a explicarlo tú.</p>
      <div className={styles.actions}><Button onClick={continuar}>Continuar</Button></div>
    </>
  );
}
