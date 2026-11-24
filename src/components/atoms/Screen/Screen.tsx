import clsx from 'clsx';
import styles from './Screen.module.css';

/** Columna principal. `sinTabs` quita el espacio de la barra inferior (pantallas de estudio, donde no se muestra). */
export function Screen({ children, sinTabs }: { children: React.ReactNode; sinTabs?: boolean }) {
  return <main className={clsx(styles.root, sinTabs && styles.sinTabs)}>{children}</main>;
}
