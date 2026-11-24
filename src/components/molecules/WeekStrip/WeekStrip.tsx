import clsx from 'clsx';
import { addDays } from '@/utils/dates';
import styles from './WeekStrip.module.css';

const LETRA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function WeekStrip({ dias, hoy }: { dias: string[]; hoy: string }) {
  const sem = [...Array(7)].map((_, i) => addDays(hoy, i - 6));
  return (
    <div className={styles.week} aria-label="Últimos 7 días">
      {sem.map((k) => (
        <div key={k} className={clsx(styles.dia, dias.includes(k) && styles.on, k === hoy && styles.hoy)} title={k}>
          <span>{LETRA[new Date(`${k}T12:00:00`).getDay()]}</span>
          <span className={styles.dot} aria-label={dias.includes(k) ? 'estudiaste' : 'sin estudiar'}>{dias.includes(k) ? '🔥' : ''}</span>
        </div>
      ))}
    </div>
  );
}
