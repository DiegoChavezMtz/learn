'use client';
import { Button } from '@/components/atoms/Button';
import { RichText } from '@/components/atoms/RichText';
import type { Tarjeta } from '@/types/lesson';
import { Visual } from '../Visuales';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

export function Concepto({ tarjeta: c, kicker, onNext }: CardProps<Extract<Tarjeta, { tipo: 'concepto' }>>) {
  return (
    <>
      <span className={styles.kicker}>{kicker}</span>
      <h2>{c.titulo}</h2>
      {c.visual && <Visual tipo={c.visual} />}
      <RichText texto={c.texto} />
      <div className={styles.actions}><Button onClick={onNext}>Continuar</Button></div>
    </>
  );
}
