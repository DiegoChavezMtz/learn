'use client';
import { useMemo, useRef, useState } from 'react';
import { useProgreso } from '@/context/ProgresoContext';
import type { ItemTarjeta } from '@/types/lesson';
import type { StatsSesion } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';
import { XP } from '@/utils/xp';
import { Tarjeta, type StatsApi } from '../Tarjeta';
import styles from './Player.module.css';

type Props = { items: ItemTarjeta[]; onExit: () => void; onFinish: (stats: StatsSesion) => void; evaluar?: Evaluador };

/** Reproduce tarjetas de una en una (D12). Lo comparten la sesión y el repaso. Cada respuesta suma XP y se ve al instante. */
export function Player({ items, onExit, onFinish, evaluar }: Props) {
  const { sumarXp } = useProgreso();
  const [i, setI] = useState(0);
  const [ganado, setGanado] = useState<{ n: number; k: number; nota?: string } | null>(null);
  const [combo, setCombo] = useState(0); // aciertos seguidos
  const stats = useRef<StatsSesion>({ xp: 0, aciertos: 0, total: 0, mini: null, ia: null, texto: {} });
  const k = useRef(0);

  // `intento` (historial) lo añade Tarjeta; aquí van los contadores y el XP de la sesión.
  const api = useMemo<Omit<StatsApi, 'intento'>>(() => {
    const premio = (n: number, nota?: string) => { sumarXp(n); stats.current.xp += n; setGanado({ n, k: ++k.current, nota }); };
    return {
      responder: (bien) => {
        stats.current.total++;
        if (bien) stats.current.aciertos++;
        premio(bien ? XP.acierto : XP.intento);
        setCombo((c) => (bien ? c + 1 : 0));
        if (typeof navigator !== 'undefined') navigator.vibrate?.(bien ? 12 : [20, 40, 20]);
      },
      guardarTexto: (id, texto) => { stats.current.texto[id] = texto; },
      participar: () => premio(XP.preprueba),
      corta: (resultado, tutor) => {
        stats.current.total++;
        if (resultado === 'ok') stats.current.aciertos++; // «ayuda» no es acierto pleno (C1 v0.13)
        if (tutor) premio(XP.corta[resultado]);
        else premio(XP.explicaAuto, resultado === 'ok' ? undefined : 'Gracias por ser honesto 💛');
      },
      guardarMini: (mini, ia) => {
        stats.current.mini = mini; stats.current.ia = ia;
        // Con el tutor, la escala; autocalificada, XP fijo. Elegir 🟡 o ❌ sin tutor merece un gracias, no menos puntos.
        if (ia) premio(XP.explica[mini]);
        else premio(XP.explicaAuto, mini === 'ok' ? undefined : 'Gracias por ser honesto 💛');
      },
    };
  }, [sumarXp]);

  const avanzar = () => {
    window.scrollTo(0, 0);
    if (i + 1 >= items.length) onFinish(stats.current);
    else setI(i + 1);
  };

  return (
    <div className={styles.player}>
      <div className={styles.head}>
        <button type="button" className={styles.x} onClick={onExit} aria-label="Salir">✕</button>
        <div className={styles.bar} role="progressbar" aria-valuenow={i} aria-valuemax={items.length} aria-label="Avance de la sesión">
          <div className={styles.fill} style={{ width: `${(i / items.length) * 100}%` }} />
        </div>
        <span className={styles.count}>{i + 1}/{items.length}</span>
      </div>
      {combo >= 3 && <span key={combo} className={styles.combo} aria-live="polite">🔥 {combo} seguidas</span>}
      {ganado && <span key={ganado.k} className={styles.xp} aria-live="polite">+{ganado.n} XP{ganado.nota ? ` · ${ganado.nota}` : ''}</span>}
      <div className={styles.slot}>
        <Tarjeta key={items[i].tarjeta.id + i} item={items[i]} onNext={avanzar} stats={api} evaluar={evaluar} />
      </div>
    </div>
  );
}
