'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { authService } from '@/services/auth.service';
import styles from './LoginView.module.css';

/** Primera pantalla de la app: sin sesión no se ve ni se navega nada más. */
export function LoginView({ sinConfig }: { sinConfig: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setError('');
    try {
      // Al iniciar sesión, SesionGate recibe el cambio y muestra la app.
      await authService.entrar(email.trim(), password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(/invalid/i.test(msg) ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.');
      setOcupado(false);
    }
  };

  return (
    <main className={styles.pagina}>
      <div className={styles.marca}>
        <span className={styles.logo} aria-hidden="true">A</span>
        <h1 className={styles.titulo}>Aprender</h1>
        <p className={styles.sub}>Estudio diario de redes y ciberseguridad.</p>
      </div>

      {sinConfig ? (
        <div className={styles.aviso}>
          La app todavía no tiene conectada su cuenta. Falta configurar Supabase en las variables de entorno.
        </div>
      ) : (
        <form className={styles.tarjeta} onSubmit={entrar}>
          <label className={styles.campo}>
            <span>Correo</span>
            <input className={styles.input} type="email" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu correo" required />
          </label>
          <label className={styles.campo}>
            <span>Contraseña</span>
            <input className={styles.input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="contraseña" required />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <Button type="submit" disabled={ocupado || !email.includes('@') || password.length < 6}>{ocupado ? 'Entrando…' : 'Entrar'}</Button>
          <p className={styles.nota}>Tu progreso se guarda en tu cuenta.</p>
        </form>
      )}
    </main>
  );
}
