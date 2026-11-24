'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components/atoms/Screen';
import { Player } from '@/components/organisms/Player';
import { useProgreso } from '@/context/ProgresoContext';
import { TemaProvider } from '@/context/TemaContext';
import type { Leccion, Sesion } from '@/types/lesson';
import type { StatsSesion } from '@/types/progreso';
import type { Evaluador } from '@/types/tutor';
import { buscarSesion, itemsDeSesion } from '@/utils/lesson';
import { construirRegistro } from '@/utils/registro';
import { FinSesion } from '../FinSesion';
import styles from './SesionView.module.css';

function Jugar({ leccion, sesion, evaluar }: { leccion: Leccion; sesion: Sesion; evaluar?: Evaluador }) {
  const router = useRouter();
  const { terminarSesion, progreso } = useProgreso();
  const [items] = useState(() => itemsDeSesion(sesion));
  const [inicio] = useState(() => Date.now());
  const [cierre, setCierre] = useState<{ stats: StatsSesion; fin: number } | null>(null);

  if (cierre) {
    const { stats, fin } = cierre;
    // Tu camino en este tema: lo publicado (cada sesión nueva abre un paso más).
    const publicadas = leccion.sesiones;
    const yaHecha = !!progreso.sesiones[sesion.id]?.terminada;
    const antes = publicadas.filter((s) => progreso.sesiones[s.id]?.terminada).length;
    const despues = antes + (yaHecha ? 0 : 1);
    const siguiente = publicadas.find((s) => s.id !== sesion.id && !progreso.sesiones[s.id]?.terminada);
    const camino = { antes, despues, total: publicadas.length, siguiente: siguiente ? { id: siguiente.id, titulo: siguiente.titulo, minutos: siguiente.minutos } : undefined, tema: leccion.tema };
    return (
      <FinSesion
        sesion={sesion} stats={stats} camino={camino} minutos={Math.max(1, Math.round((fin - inicio) / 60000))}
        onGuardar={({ interes, claridad, nota }, destino) => {
          const registro = construirRegistro({ tema: leccion.tema, sesion, stats, inicio, interes, claridad, nota });
          terminarSesion(sesion.id, { aciertos: stats.aciertos, total: stats.total, mini: stats.mini }, registro);
          router.push(destino === 'siguiente' && siguiente ? `/tema/${leccion.tema}/sesion/${siguiente.id}` : '/');
        }}
      />
    );
  }
  return <Player items={items} onExit={() => router.push(`/tema/${leccion.tema}`)} onFinish={(s) => setCierre({ stats: { ...s, texto: { ...s.texto } }, fin: Date.now() })} evaluar={evaluar} />;
}

function Contenido({ leccion, sesionId, evaluar }: { leccion: Leccion; sesionId: string; evaluar?: Evaluador }) {
  const { listo } = useProgreso();
  const sesion = buscarSesion(leccion, sesionId);
  if (!listo) return <Screen sinTabs><p>Cargando…</p></Screen>;
  if (!sesion) {
    return (
      <Screen sinTabs><div className={styles.hoy}><p>Esa sesión todavía no existe.</p><Button href={`/tema/${leccion.tema}`}>Volver al tema</Button></div></Screen>
    );
  }
  return <Screen sinTabs><Jugar leccion={leccion} sesion={sesion} evaluar={evaluar} /></Screen>;
}

export function SesionView(props: { leccion: Leccion; sesionId: string; evaluar?: Evaluador }) {
  return <TemaProvider tema={props.leccion.tema}><Contenido {...props} /></TemaProvider>;
}
