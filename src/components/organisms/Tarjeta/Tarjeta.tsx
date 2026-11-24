'use client';
import type { CSSProperties } from 'react';
import type { ItemTarjeta } from '@/types/lesson';
import type { Evaluador } from '@/types/tutor';
import { layerColor, pasoColor } from '@/utils/lesson';
import { Abierta } from './Abierta';
import { Concepto } from './Concepto';
import { Explica } from './Explica';
import { Opcion } from './Opcion';
import { Orden } from './Orden';
import { Preprueba } from './Preprueba';
import { Reflexion } from './Reflexion';
import styles from './tarjeta.module.css';
import type { StatsApi } from './types';
import { Vf } from './Vf';
import { Video } from './Video';

type Props = { item: ItemTarjeta; onNext: () => void; stats: StatsApi; evaluar?: Evaluador };

export function Tarjeta({ item, onNext, stats, evaluar }: Props) {
  const { tarjeta: t, paso, repaso } = item;
  const capa = 'capa' in t ? t.capa : undefined;
  const color = capa ? layerColor(capa) : pasoColor[paso] ?? 'var(--accent)';
  const p = { onNext, stats, kicker: repaso ? 'Repaso' : paso };

  let cuerpo: React.ReactNode;
  switch (t.tipo) {
    case 'concepto': cuerpo = <Concepto tarjeta={t} {...p} />; break;
    case 'opcion': cuerpo = <Opcion tarjeta={t} {...p} />; break;
    case 'vf': cuerpo = <Vf tarjeta={t} {...p} />; break;
    case 'orden': cuerpo = <Orden tarjeta={t} {...p} />; break;
    case 'preprueba': cuerpo = <Preprueba tarjeta={t} {...p} />; break;
    case 'reflexion': cuerpo = <Reflexion tarjeta={t} {...p} />; break;
    case 'video': cuerpo = <Video tarjeta={t} {...p} />; break;
    case 'abierta': cuerpo = <Abierta tarjeta={t} {...p} />; break;
    case 'explica': cuerpo = <Explica tarjeta={t} {...p} evaluar={evaluar} />; break;
  }
  return <article className={styles.card} style={{ '--cc': color } as CSSProperties}>{cuerpo}</article>;
}
