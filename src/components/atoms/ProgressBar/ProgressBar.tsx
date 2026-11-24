import type { CSSProperties } from 'react';
import styles from './ProgressBar.module.css';

export function ProgressBar({ value, color, label }: { value: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={styles.fill} style={{ width: `${pct}%`, '--c': color } as CSSProperties} />
    </div>
  );
}
