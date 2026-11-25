'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { useSync } from '@/context/SyncContext';
import { vencidos } from '@/utils/spacedRepetition';
import styles from './TabBar.module.css';

// En el reproductor de tarjetas la barra estorba: se oculta.
const oculta = (path: string) => /^\/tema\/[^/]+\/(sesion|repaso|repasar)/.test(path);
const esMapa = (p: string) => p === '/' || p.startsWith('/curso') || p.startsWith('/tema');

export function TabBar() {
  const path = usePathname();
  const { todos, hoy, listo } = useProgresoCurso();
  const { estado } = useSync();
  if (oculta(path)) return null;
  const pendientes = listo ? Object.values(todos).reduce((s, p) => s + vencidos(p.repaso, hoy).length, 0) : 0;
  const mapa = esMapa(path), progreso = path.startsWith('/progreso'), hoyOn = path.startsWith('/hoy'), videos = path.startsWith('/videos'), cuenta = path.startsWith('/cuenta');
  return (
    <nav className={styles.bar} aria-label="Navegación principal">
      <div className={styles.list}>
        <Link href="/" className={clsx(styles.tab, mapa && styles.on)} aria-current={mapa ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4L3 6.5v13L9 17m0-13l6 2.5M9 4v13m6-10.5L21 4v13l-6 2.5M15 6.5v13M9 17l6 2.5" /></svg>
          Mapa
        </Link>
        <Link href="/videos" className={clsx(styles.tab, videos && styles.on)} aria-current={videos ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5-4.5-2.5z" /></svg>
          Videos
        </Link>
        <Link href="/hoy" className={clsx(styles.centro, hoyOn && styles.on)} aria-current={hoyOn ? 'page' : undefined} aria-label={pendientes ? `Hoy, ${pendientes} repasos pendientes` : 'Hoy'}>
          <span className={styles.boton}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4.5 13.5H11L10 22l9-12h-6.5L13 2z" /></svg>
          </span>
          {pendientes > 0 && <span className={styles.badge}>{pendientes > 99 ? '99+' : pendientes}</span>}
          Hoy
        </Link>
        <Link href="/progreso" className={clsx(styles.tab, progreso && styles.on)} aria-current={progreso ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
          Progreso
        </Link>
        <Link href="/cuenta" className={clsx(styles.tab, cuenta && styles.on)} aria-current={cuenta ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" /></svg>
          Cuenta
          {estado === 'error' && <span className={styles.punto} aria-label="Sin sincronizar" />}
        </Link>
      </div>
    </nav>
  );
}
