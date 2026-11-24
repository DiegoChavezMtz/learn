'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import { authService } from '@/services/auth.service';
import type { Tarjeta } from '@/types/lesson';
import type { Evaluacion, Mini } from '@/types/progreso';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

const CIRC = 169.6;
const ETIQUETA: Record<Mini, string> = { ok: '✅ Salió', huecos: '🟡 Con huecos', no: '❌ No salió todavía' };
const MENSAJE = {
  'sin-sesion': 'Inicia sesión en Cuenta para usar el tutor. Califícate tú por ahora.',
  'no-disponible': 'El tutor no está disponible ahora. Califícate tú.',
  'texto-invalido': 'Escribe tu explicación primero (entre 15 y 6000 caracteres).',
} as const;

export function Explica({ tarjeta: c, kicker, onNext, stats, evaluar }: CardProps<Extract<Tarjeta, { tipo: 'explica' }>>) {
  const { calificar } = useProgreso();
  const seg = c.segundos || 60; // duración del temporizador (C1)
  const [texto, setTexto] = useState('');
  const [t, setT] = useState<number | null>(null); // segundos restantes; null = sin iniciar
  const [corriendo, setCorriendo] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [revision, setRevision] = useState<Evaluacion | null>(null);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setT((x) => (x === null ? x : x - 1)), 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  const mostrado = t ?? seg;
  const clk = `${mostrado < 0 ? '+' : ''}${Math.floor(Math.abs(mostrado) / 60)}:${String(Math.abs(mostrado) % 60).padStart(2, '0')}`;
  const iniciar = () => { setT(seg); setCorriendo(true); };

  const cerrar = (v: Mini, ia: Evaluacion | null) => {
    setCorriendo(false);
    stats.guardarMini(v, ia);
    stats.guardarTexto(c.id, texto.trim());
    if (c.repaso !== false) calificar(c.id, v === 'ok'); // repaso: false = no entra al repaso espaciado (C1)
    onNext();
  };

  const pedirRevision = async () => {
    if (!evaluar) return;
    setRevisando(true); setAviso('');
    try {
      const r = await evaluar({ prompt: c.prompt, puntos: c.puntos, texto, token: await authService.getAccessToken() });
      if (r.ok) setRevision(r.evaluacion); else setAviso(MENSAJE[r.error]);
    } catch {
      setAviso('Sin conexión con el tutor. Califícate tú.'); // sin red: la autocalificación siempre está disponible
    } finally {
      setRevisando(false);
    }
  };

  return (
    <>
      <span className={styles.kicker}>{kicker} · explícalo en {seg >= 120 ? `${Math.round(seg / 60)} minutos` : '1 minuto'}</span>
      <h2>{c.prompt}</h2>
      <div className={styles.timer}>
        <svg className={styles.ring} viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="27" stroke="var(--wash)" />
          <circle
            cx="32" cy="32" r="27" stroke={mostrado <= 0 && t !== null ? 'var(--bad)' : 'var(--cc)'}
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - Math.max(mostrado, 0) / seg)}
            transform="rotate(-90 32 32)" strokeLinecap="round"
          />
        </svg>
        <div>
          <div className={styles.clock}>{clk}</div>
          <Button variant="ghost" className={styles.timerBtn} onClick={iniciar}>{t === null ? 'Iniciar' : 'Reiniciar'}</Button>
        </div>
      </div>
      <p className={`${styles.muted} ${styles.small}`}>Sin ver nada. Escríbelo o díctalo con el micrófono del teclado.</p>
      <textarea className={styles.textarea} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Mi explicación…" readOnly={!!revision} />

      {revision && (
        <div className={styles.ai}>
          <strong>{ETIQUETA[revision.resultado]}</strong>
          {revision.comentario && <span>{revision.comentario}</span>}
          {revision.bien.length > 0 && <><span className={styles.small}><strong>Bien:</strong></span><ul className={styles.small}>{revision.bien.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
          {revision.huecos.length > 0 && <><span className={styles.small}><strong>Huecos:</strong></span><ul className={styles.small}>{revision.huecos.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
        </div>
      )}
      {aviso && <p className={clsx(styles.note, styles.err)}>{aviso}</p>}

      <div className={styles.actions}>
        {revision ? (
          <Button onClick={() => cerrar(revision.resultado, revision)}>Continuar</Button>
        ) : (
          <>
            {evaluar && <Button disabled={revisando} onClick={() => void pedirRevision()}>{revisando ? 'Revisando…' : 'Que el tutor lo revise'}</Button>}
            <p className={styles.small}><strong>{evaluar ? 'O califícate tú:' : '¿Cómo te salió?'}</strong></p>
            <div className={styles.self}>
              <button type="button" className={styles.opt} onClick={() => cerrar('ok', null)}>✅ Salió</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('huecos', null)}>🟡 Huecos</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('no', null)}>❌ No</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
