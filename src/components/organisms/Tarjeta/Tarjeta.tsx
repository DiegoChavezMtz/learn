'use client';
import { useMemo, type CSSProperties } from 'react';
import { useProgreso } from '@/context/ProgresoContext';
import type { ItemTarjeta } from '@/types/lesson';
import type { ContextoIntento, ResultadoCorta } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';
import { layerColor, pasoColor } from '@/utils/lesson';
import { Abierta } from './Abierta';
import { Armar } from './Armar';
import { Clasificar } from './Clasificar';
import { Concepto } from './Concepto';
import { Corta } from './Corta';
import { Emparejar } from './Emparejar';
import { Explica } from './Explica';
import { Hallar } from './Hallar';
import { Opcion } from './Opcion';
import { Orden } from './Orden';
import { Preprueba } from './Preprueba';
import { Reflexion } from './Reflexion';
import styles from './tarjeta.module.css';
import type { StatsApi } from './types';
import { Vf } from './Vf';
import { Video } from './Video';

/** El reproductor da el API de sesión; `intento` lo añade este envoltorio (anota en el historial). */
type Props = { item: ItemTarjeta; onNext: () => void; stats: Omit<StatsApi, 'intento'>; evaluar?: Evaluador };

export function Tarjeta({ item, onNext, stats, evaluar }: Props) {
  const { tarjeta: t, paso, repaso, libre, sesion } = item;
  const { registrarIntento } = useProgreso();
  const capa = 'capa' in t ? t.capa : undefined;
  const color = capa ? layerColor(capa) : pasoColor[paso] ?? 'var(--accent)';
  const contexto: ContextoIntento = libre ? 'libre' : repaso ? 'repaso' : 'sesion';

  // Cada respuesta se anota en el historial (C3, D39) con su concepto. Las tarjetas no lo saben: lo pone este envoltorio.
  const api = useMemo<StatsApi>(() => {
    const anotar = (resultado: ResultadoCorta, respuesta: string) =>
      registrarIntento({ tarjeta: t.id, concepto: t.concepto ?? null, tipo: t.tipo, contexto, sesion: sesion ?? null, resultado, respuesta });
    return {
      ...stats,
      responder: (bien, respuesta = '') => { stats.responder(bien, respuesta); anotar(bien ? 'ok' : 'no', respuesta); },
      intento: (resultado, respuesta) => anotar(resultado, respuesta),
    };
  }, [stats, registrarIntento, t.id, t.concepto, t.tipo, contexto, sesion]);

  const p = { onNext, stats: api, kicker: libre ? 'Práctica libre' : repaso ? 'Repaso' : paso };

  let cuerpo: React.ReactNode;
  switch (t.tipo) {
    case 'concepto': cuerpo = <Concepto tarjeta={t} {...p} />; break;
    case 'opcion': cuerpo = <Opcion tarjeta={t} {...p} />; break;
    case 'vf': cuerpo = <Vf tarjeta={t} {...p} />; break;
    case 'orden': cuerpo = <Orden tarjeta={t} {...p} />; break;
    case 'emparejar': cuerpo = <Emparejar tarjeta={t} {...p} />; break;
    case 'clasificar': cuerpo = <Clasificar tarjeta={t} {...p} />; break;
    case 'armar': cuerpo = <Armar tarjeta={t} {...p} />; break;
    case 'error': cuerpo = <Hallar tarjeta={t} {...p} />; break;
    case 'preprueba': cuerpo = <Preprueba tarjeta={t} {...p} />; break;
    case 'reflexion': cuerpo = <Reflexion tarjeta={t} {...p} />; break;
    case 'video': cuerpo = <Video tarjeta={t} {...p} />; break;
    case 'abierta': cuerpo = <Abierta tarjeta={t} {...p} />; break;
    case 'corta': cuerpo = <Corta tarjeta={t} {...p} evaluar={evaluar} />; break;
    case 'explica': cuerpo = <Explica tarjeta={t} {...p} evaluar={evaluar} />; break;
    case 'conversa': cuerpo = null; break; // se omite en el catálogo de sesiones (utils/lesson.ts)
  }
  return <article className={styles.card} style={{ '--cc': color } as CSSProperties}>{cuerpo}</article>;
}
