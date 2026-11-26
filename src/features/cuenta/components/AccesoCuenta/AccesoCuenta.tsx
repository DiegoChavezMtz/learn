'use client';
import { Button } from '@/components/atoms/Button';
import { useSync } from '@/context/SyncContext';
import { authService } from '@/services/auth.service';
import styles from './Seccion.module.css';

const ESTADO = { 'sin-config': '', 'sin-sesion': 'Sin sesión', sincronizando: 'Sincronizando…', ok: 'Todo guardado en tu cuenta ✓', error: 'Sin conexión con tu cuenta; se enviará después' } as const;

/** Estado de la cuenta. El inicio de sesión ya no está aquí: lo pide la app antes de mostrar nada. */
export function AccesoCuenta() {
  const { estado, email: sesionEmail, sincronizar } = useSync();

  return (
    <section className={styles.sec}>
      <h2>Cuenta</h2>
      {sesionEmail ? (
        <>
          <p>{sesionEmail}</p>
          <p className={estado === 'error' ? styles.err : styles.ok}>{ESTADO[estado]}</p>
          <Button variant="ghost" small onClick={() => void sincronizar()}>Sincronizar ahora</Button>
          <Button variant="ghost" small onClick={() => void authService.cerrarSesion()}>Cerrar sesión</Button>
        </>
      ) : (
        <p className={styles.muted}>La sincronización con tu cuenta no está activa. Todo se guarda en este dispositivo.</p>
      )}
    </section>
  );
}
