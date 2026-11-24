'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { Player } from '@/components/organisms/Player';
import { useProgreso } from '@/context/ProgresoContext';
import { TemaProvider } from '@/context/TemaContext';
import type { Leccion } from '@/types/lesson';
import type { StatsSesion } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';
import { colaRepaso, idsPendientes } from '@/utils/lesson';
import styles from './RepasoView.module.css';

function Cola({ leccion, luego, evaluar }: { leccion: Leccion; luego?: string; evaluar?: Evaluador }) {
  const router = useRouter();
  const { progreso, hoy, marcarDia } = useProgreso();
  // La cola se fija al empezar: calificar durante el repaso no la cambia.
  const [items] = useState(() => colaRepaso(leccion, idsPendientes(leccion, progreso.repaso, hoy)));
  const [stats, setStats] = useState<StatsSesion | null>(null);

  if (items.length === 0) {
    return <div className={styles.col}><p>No tienes repasos pendientes.</p><Button href={luego ? `/tema/${leccion.tema}/sesion/${luego}` : '/hoy'}>{luego ? 'Ir a la sesión' : 'Volver a Hoy'}</Button></div>;
  }
  if (stats) {
    return (
      <div className={styles.player}>
        <article className={styles.card}>
          <span className={styles.kicker}>Repaso terminado 🔁</span>
          <div className={styles.big}>{stats.aciertos}/{stats.total}</div>
          <h2>{stats.aciertos === stats.total ? 'Todo en su lugar' : 'Las que fallaste vuelven mañana'}</h2>
          <div className={styles.actions}><Button variant="light" href="/hoy">Volver a Hoy</Button></div>
        </article>
      </div>
    );
  }
  return (
    <Player
      items={items} evaluar={evaluar} onExit={() => router.push('/hoy')}
      onFinish={(s) => { marcarDia(); if (luego) router.push(`/tema/${leccion.tema}/sesion/${luego}`); else setStats(s); }}
    />
  );
}

/** El parámetro `luego` (sesión a seguir después del repaso) se lee en el cliente: así la ruta es estática y funciona sin conexión. */
function Contenido({ leccion, evaluar }: { leccion: Leccion; evaluar?: Evaluador }) {
  const { listo } = useProgreso();
  const luego = useSearchParams().get('luego') ?? undefined;
  if (!listo) return <Screen sinTabs><p>Cargando…</p></Screen>;
  return <Screen sinTabs><Cola leccion={leccion} luego={luego} evaluar={evaluar} /></Screen>;
}

export function RepasoView(props: { leccion: Leccion; evaluar?: Evaluador }) {
  return <TemaProvider tema={props.leccion.tema}><Contenido {...props} /></TemaProvider>;
}
