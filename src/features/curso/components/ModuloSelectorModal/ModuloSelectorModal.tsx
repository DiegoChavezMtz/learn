'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import type { ModuloCurso } from '@/types/curso';
import type { Progreso } from '@/types/progreso';
import { avanceModulo, colorModulo } from '@/utils/curso';
import { moduloEstaBloqueado } from '../../utils/mapa';
import styles from './ModuloSelectorModal.module.css';

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  modulos: ModuloCurso[];
  moduloSeleccionado: number;
  moduloActual: number;
  onSeleccionarModulo: (n: number) => void;
  onModuloBloqueado: (msg: string) => void;
  todos: Record<string, Progreso>;
};

export function ModuloSelectorModal({
  abierto,
  onCerrar,
  modulos,
  moduloSeleccionado,
  moduloActual,
  onSeleccionarModulo,
  onModuloBloqueado,
  todos,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className={styles.backdrop} onClick={onCerrar} role="dialog" aria-modal="true" aria-label="Seleccionar módulo">
      <div className={styles.sheet} ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.sub}>Temario del curso</span>
            <h2 className={styles.titulo}>Elige un módulo</h2>
          </div>
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div className={styles.lista}>
          {modulos.map((m) => {
            const bloqueado = moduloEstaBloqueado(m, moduloActual);
            const seleccionado = m.n === moduloSeleccionado;
            const a = avanceModulo(m, todos);
            const completo = a.disponibles > 0 && a.hechos >= a.disponibles;

            return (
              <button
                key={m.n}
                type="button"
                className={clsx(
                  styles.item,
                  bloqueado && styles.bloqueado,
                  seleccionado && styles.seleccionado,
                  completo && styles.completo
                )}
                style={{ '--mc': colorModulo(m.n) } as CSSProperties}
                onClick={() => {
                  if (bloqueado) {
                    onModuloBloqueado(
                      a.disponibles === 0
                        ? `El Módulo ${m.n} se abrirá cuando se publique su contenido.`
                        : `El Módulo ${m.n} está bloqueado. Completa los módulos anteriores primero.`
                    );
                  } else {
                    onSeleccionarModulo(m.n);
                    onCerrar();
                  }
                }}
              >
                <span className={styles.numero}>
                  {bloqueado ? '🔒' : completo ? '✓' : m.n}
                </span>

                <div className={styles.info}>
                  <div className={styles.topInfo}>
                    <span className={styles.kicker}>Módulo {m.n}</span>
                    <span className={styles.estadoPill}>
                      {bloqueado ? 'Bloqueado' : completo ? 'Completado' : seleccionado ? 'Viendo ahora' : 'Desbloqueado'}
                    </span>
                  </div>
                  <strong className={styles.nombre}>{m.titulo}</strong>
                  <span className={styles.meta}>
                    {m.temas.length} temas · {m.horas} hrs {m.proyecto ? '· Proyecto integrador' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
