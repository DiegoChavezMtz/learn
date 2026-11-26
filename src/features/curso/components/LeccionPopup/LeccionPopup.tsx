'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import type { TemaCurso } from '@/types/curso';
import type { EstadoLeccion, LeccionItem } from '../../utils/mapa';
import styles from './LeccionPopup.module.css';

export type PopupSeleccion =
  | {
      tipo: 'leccion';
      s: LeccionItem;
      t: TemaCurso;
      estado: EstadoLeccion;
      color: { primario: string; fondo: string; borde: string };
      linkHref: string;
      enProgreso?: boolean;
    }
  | {
      tipo: 'repaso';
      t: TemaCurso;
      nRepasos: number;
      color: { primario: string; fondo: string; borde: string };
      linkHref: string;
    }
  | {
      tipo: 'tema';
      t: TemaCurso;
      bloqueado: boolean;
      nRepasos?: number;
      color: { primario: string; fondo: string; borde: string };
      linkHref: string;
    };

type Props = {
  seleccion: PopupSeleccion | null;
  onCerrar: () => void;
};

export function LeccionPopup({ seleccion, onCerrar }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!seleccion) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seleccion, onCerrar]);

  if (!seleccion) return null;

  const esLeccion = seleccion.tipo === 'leccion';
  const esRepaso = seleccion.tipo === 'repaso';
  const esTema = seleccion.tipo === 'tema';
  const { color } = seleccion;

  const bloqueado = esLeccion
    ? seleccion.estado === 'bloqueado' || seleccion.s.placeholder
    : esTema
    ? seleccion.bloqueado
    : false;

  const estadoBadge = esRepaso
    ? seleccion.nRepasos > 0
      ? { texto: `🔁 ${seleccion.nRepasos} para hoy`, cls: styles.badgeActual }
      : { texto: '✓ Al día', cls: styles.badgeHecho }
    : esLeccion
    ? seleccion.estado === 'hecho'
      ? { texto: '✓ Completada', cls: styles.badgeHecho }
      : seleccion.estado === 'actual'
      ? { texto: '▶ En curso', cls: styles.badgeActual }
      : { texto: '🔒 Bloqueada', cls: styles.badgeBloqueado }
    : seleccion.bloqueado
    ? { texto: '🔒 Tema bloqueado', cls: styles.badgeBloqueado }
    : seleccion.nRepasos && seleccion.nRepasos > 0
    ? { texto: `🔁 ${seleccion.nRepasos} repasos`, cls: styles.badgeActual }
    : { texto: '✓ Tema disponible', cls: styles.badgeHecho };

  return (
    <div className={styles.backdrop} onClick={onCerrar} role="dialog" aria-modal="true">
      <div
        className={styles.card}
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{ '--tc': color.primario, '--tc-bg': color.fondo, '--tc-border': color.borde } as CSSProperties}
      >
        <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
          ✕
        </button>

        {/* Encabezado con información del tema */}
        <div className={styles.header}>
          <div className={styles.topMeta}>
            <span className={styles.kicker}>
              {esRepaso ? 'Repaso Obligatorio · ' : ''}Tema {seleccion.t.id}
            </span>
            <span className={clsx(styles.badge, estadoBadge.cls)}>
              {estadoBadge.texto}
            </span>
          </div>
          <h3 className={styles.temaTitulo}>{seleccion.t.titulo}</h3>
          {seleccion.t.pregunta && (
            <p className={styles.temaPregunta}>{seleccion.t.pregunta}</p>
          )}
        </div>

        {/* Detalle específico de la lección */}
        {esLeccion && (
          <div className={styles.leccionCuerpo}>
            <div className={styles.leccionIcono}>
              {seleccion.estado === 'hecho' ? '✓' : seleccion.estado === 'actual' ? '▶' : '🔒'}
            </div>
            <div className={styles.leccionDetalles}>
              <span className={styles.pasoTag}>
                {seleccion.s.paso} · {seleccion.s.minutos} min
              </span>
              <h4 className={styles.leccionTitulo}>{seleccion.s.titulo}</h4>
            </div>
          </div>
        )}

        {/* Detalle específico de un nodo de repaso */}
        {esRepaso && (
          <div className={styles.leccionCuerpo}>
            <div className={styles.leccionIcono}>🔁</div>
            <div className={styles.leccionDetalles}>
              <span className={styles.pasoTag}>Repaso Programado (Curva del Olvido)</span>
              <h4 className={styles.leccionTitulo}>
                {seleccion.nRepasos > 0
                  ? `${seleccion.nRepasos} ${seleccion.nRepasos === 1 ? 'tarjeta programada' : 'tarjetas programadas'} para hoy`
                  : 'Tarjetas al corriente en este tema'}
              </h4>
            </div>
          </div>
        )}

        {/* Mensaje de estado */}
        <div className={styles.estadoNota}>
          {esRepaso ? (
            seleccion.nRepasos > 0 ? (
              <p>🔁 El algoritmo de memoria programó estas tarjetas para hoy. Cada acierto amplía su intervalo y afianza tu retención.</p>
            ) : (
              <p>✓ No tienes tarjetas vencidas hoy en este tema. Tus repasos volverán a programarse solos.</p>
            )
          ) : bloqueado ? (
            <p>
              🔒 Esta {esLeccion ? 'lección' : 'sección'} aún no está desbloqueada.{' '}
              {esLeccion && seleccion.s.placeholder
                ? 'Se abrirá cuando se publique el contenido.'
                : 'Completa las actividades previas para acceder.'}
            </p>
          ) : esLeccion && seleccion.estado === 'hecho' ? (
            <p>✓ Ya completaste esta lección. Puedes volver a entrar para repasar su contenido.</p>
          ) : (
            <p>▶ Esta es tu lección activa. ¡Listo para avanzar!</p>
          )}
        </div>

        {/* Botón de acción */}
        <div className={styles.acciones}>
          {bloqueado ? (
            <button type="button" disabled className={styles.btnDeshabilitado}>
              🔒 Bloqueado
            </button>
          ) : esRepaso ? (
            <Button
              href={seleccion.linkHref}
              variant={seleccion.nRepasos > 0 ? 'primary' : 'ghost'}
            >
              {seleccion.nRepasos > 0
                ? `Hacer repaso obligatorio (${seleccion.nRepasos}) →`
                : 'Repasar tarjetas del tema'}
            </Button>
          ) : (
            <Button
              href={seleccion.linkHref}
              variant={esLeccion && seleccion.estado === 'hecho' ? 'ghost' : 'primary'}
            >
              {esLeccion
                ? seleccion.estado === 'hecho'
                  ? 'Repasar lección'
                  : seleccion.enProgreso
                  ? 'Continuar lección →'
                  : 'Empezar lección →'
                : 'Ver tema completo →'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
