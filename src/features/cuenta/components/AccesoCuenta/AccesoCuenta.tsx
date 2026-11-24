'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useSync } from '@/context/SyncContext';
import { authService } from '@/services/auth.service';
import styles from './Seccion.module.css';

const ESTADO = { 'sin-config': '', 'sin-sesion': 'Sin sesión', sincronizando: 'Sincronizando…', ok: 'Todo guardado en tu cuenta ✓', error: 'Sin conexión con tu cuenta; se enviará después' } as const;

export function AccesoCuenta() {
  const { estado, email: sesionEmail, sincronizar } = useSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');

  const intentar = async (fn: () => Promise<void>) => {
    setOcupado(true); setError('');
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar'); } finally { setOcupado(false); }
  };

  if (estado === 'sin-config') {
    return (
      <section className={styles.sec}>
        <h2>Cuenta</h2>
        <p className={styles.muted}>La sincronización con tu cuenta todavía no está configurada. Mientras tanto todo se guarda en este dispositivo y puedes exportar tu registro más abajo.</p>
      </section>
    );
  }

  if (sesionEmail) {
    return (
      <section className={styles.sec}>
        <h2>Cuenta</h2>
        <p>{sesionEmail}</p>
        <p className={estado === 'error' ? styles.err : styles.ok}>{ESTADO[estado]}</p>
        <Button variant="ghost" small onClick={() => void sincronizar()}>Sincronizar ahora</Button>
        <Button variant="ghost" small onClick={() => void authService.cerrarSesion()}>Cerrar sesión</Button>
      </section>
    );
  }

  return (
    <section className={styles.sec}>
      <h2>Iniciar sesión</h2>
      <p className={styles.muted}>Con la sesión iniciada, tu progreso se guarda en la nube y el asesor puede leer tu registro.</p>
      <form onSubmit={(e) => { e.preventDefault(); void intentar(() => authService.entrar(email.trim(), password)); }} className={styles.form}>
        <input className={styles.input} type="email" inputMode="email" autoComplete="username" placeholder="tu correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={styles.input} type="password" autoComplete="current-password" placeholder="contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={ocupado || !email.includes('@') || password.length < 6}>Entrar</Button>
      </form>
      {error && <p className={styles.err}>{error}</p>}
    </section>
  );
}
