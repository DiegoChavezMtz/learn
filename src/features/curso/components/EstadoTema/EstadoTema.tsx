import clsx from 'clsx';
import type { Avance, EstadoTema as Estado } from '@/utils/curso';
import styles from './EstadoTema.module.css';

export function EstadoTema({ estado, avance }: { estado: Estado; avance: Avance }) {
  if (estado === 'hecho') return <span className={clsx(styles.est, styles.hecho)}>✓ Listo</span>;
  if (estado === 'en-curso') return <span className={clsx(styles.est, styles.curso)}>{avance.pct}%</span>;
  if (estado === 'disponible') return <span className={clsx(styles.est, styles.ya)}>Empezar</span>;
  return <span className={styles.est}>Pronto</span>;
}
