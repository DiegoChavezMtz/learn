'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { useSync, type EstadoSync } from '@/context/SyncContext';
import styles from './SyncStatus.module.css';

const TEXTO: Record<EstadoSync, string> = {
  'sin-config': 'Cuenta y copia de seguridad',
  'sin-sesion': 'Sin cuenta · iniciar sesión para guardar en la nube',
  sincronizando: 'Sincronizando…',
  ok: 'Guardado en tu cuenta ✓',
  error: 'Sin conexión con tu cuenta: se enviará después',
};

export function SyncStatus() {
  const { estado } = useSync();
  return <Link href="/cuenta" className={clsx(styles.link, estado === 'error' && styles.err)}>{TEXTO[estado]}</Link>;
}
