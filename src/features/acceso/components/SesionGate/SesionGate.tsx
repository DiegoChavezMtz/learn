'use client';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { LoginView } from '../LoginView';
import styles from './SesionGate.module.css';

type Estado = 'cargando' | 'sin-sesion' | 'sin-config' | 'con-sesion';

/**
 * Puerta de la app: sin sesión solo se ve el inicio de sesión (y no se renderiza nada del contenido ni de la barra inferior).
 * Mientras se revisa la sesión se muestra una pantalla de carga, igual en el servidor y en el navegador.
 */
export function SesionGate({ children }: { children: React.ReactNode }) {
  // Sin Supabase configurado no hay forma de iniciar sesión: la app queda cerrada con un aviso.
  const [estado, setEstado] = useState<Estado>(() => (authService.disponible() ? 'cargando' : 'sin-config'));

  useEffect(() => {
    if (!authService.disponible()) return;
    let vivo = true;
    authService.getSession()
      .then((s) => { if (vivo) setEstado(s ? 'con-sesion' : 'sin-sesion'); })
      .catch(() => { if (vivo) setEstado('sin-sesion'); });
    const off = authService.onChange((s) => { if (vivo) setEstado(s ? 'con-sesion' : 'sin-sesion'); });
    return () => { vivo = false; off(); };
  }, []);

  if (estado === 'con-sesion') return <>{children}</>;
  if (estado === 'cargando') return <div className={styles.carga} role="status">Aprender</div>;
  return <LoginView sinConfig={estado === 'sin-config'} />;
}
