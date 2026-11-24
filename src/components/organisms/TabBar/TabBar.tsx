'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useProgresoCurso } from '@/context/ProgresoContext';
import { vencidos } from '@/utils/spacedRepetition';
import styles from './TabBar.module.css';

// En el reproductor de tarjetas la barra estorba: se oculta.
const oculta = (path: string) => /^\/tema\/[^/]+\/(sesion|repaso)/.test(path);
const esMapa = (p: string) => p === '/' || p.startsWith('/curso') || p.startsWith('/tema');

export function TabBar() {
  const path = usePathname();
  const { todos, hoy, listo } = useProgresoCurso();
  if (oculta(path)) return null;
  const pendientes = listo ? Object.values(todos).reduce((s, p) => s + vencidos(p.repaso, hoy).length, 0) : 0;
  const mapa = esMapa(path), progreso = path.startsWith('/progreso'), hoyOn = path.startsWith('/hoy');
  return (
    <nav className={styles.bar} aria-label="Navegación principal">
      <div className={styles.list}>
        <Link href="/" className={clsx(styles.tab, mapa && styles.on)} aria-current={mapa ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4L3 6.5v13L9 17m0-13l6 2.5M9 4v13m6-10.5L21 4v13l-6 2.5M15 6.5v13M9 17l6 2.5" /></svg>
          Mapa
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
      </div>
    </nav>
  );
}
