'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Tarjeta } from '@/types/lesson';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Abierta({ tarjeta: c, kicker, onNext, stats }: CardProps<Extract<Tarjeta, { tipo: 'abierta' }>>) {
  const [texto, setTexto] = useState('');
  const continuar = () => {
    const v = texto.trim();
    if (v) stats.guardarTexto(c.id, v);
    onNext();
  };
  return (
    <>
      <span className={styles.kicker}>{kicker}{c.opcional ? ' · opcional' : ''}</span>
      <h2>{c.pregunta}</h2>
      <textarea className={styles.textarea} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe o usa el micrófono del teclado" />
      <div className={styles.actions}><Button onClick={continuar}>{c.opcional ? 'Continuar' : 'Guardar'}</Button></div>
    </>
  );
}
