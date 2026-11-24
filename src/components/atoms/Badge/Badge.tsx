import clsx from 'clsx';
import styles from './Badge.module.css';

export function Badge({ tone, children }: { tone?: 'ok' | 'accent' | 'mid'; children: React.ReactNode }) {
  return <span className={clsx(styles.badge, tone && styles[tone])}>{children}</span>;
}
