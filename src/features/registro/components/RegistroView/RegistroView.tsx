import styles from './RegistroView.module.css';

// Server component por defecto. Si necesita estado de cliente,
// agrega 'use client' o mueve la lógica a un hook en ../../hooks.
export function RegistroView() {
  return <section className={styles.root}>Registro</section>;
}
