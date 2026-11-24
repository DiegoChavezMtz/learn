'use client';
import Link from 'next/link';
import { useSync } from '@/context/SyncContext';
import styles from './AccountLink.module.css';

/** Acceso a "Cuenta y datos" (arriba a la derecha). El punto avisa si algo no se ha sincronizado. */
export function AccountLink() {
  const { estado } = useSync();
  return (
    <Link href="/cuenta" className={styles.link} aria-label="Cuenta y datos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" /></svg>
      {estado === 'error' && <span className={styles.dot} />}
      {estado === 'ok' && <span className={styles.ok} />}
    </Link>
  );
}
