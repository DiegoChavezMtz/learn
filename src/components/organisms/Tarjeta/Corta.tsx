'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import { authService } from '@/services/auth.service';
import type { Tarjeta } from '@/types/lesson';
import type { Evaluacion, Mini } from '@/types/progreso';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

const ETIQUETA: Record<Mini, string> = { ok: '✅ Correcta', huecos: '🟡 A medias', no: '❌ Todavía no' };
const MENSAJE = {
  'sin-sesion': 'Inicia sesión en Cuenta para usar el tutor. Compárala tú.',
  'no-disponible': 'El tutor no está disponible ahora. Compárala tú.',
  'texto-invalido': 'Escribe tu respuesta primero (de 3 a 800 caracteres).',
} as const;

/** Respuesta corta de memoria (1-2 frases): la revisa el tutor o la persona se compara con la respuesta de referencia. */
export function Corta({ tarjeta: c, kicker, onNext, stats, evaluar }: CardProps<Extract<Tarjeta, { tipo: 'corta' }>>) {
  const { calificar } = useProgreso();
  const [texto, setTexto] = useState('');
  const [fase, setFase] = useState<'escribir' | 'manual' | 'revisada'>('escribir');
  const [revision, setRevision] = useState<Evaluacion | null>(null);
  const [revisando, setRevisando] = useState(false);
  const [aviso, setAviso] = useState('');

  const cerrar = (v: Mini, tutor: boolean) => {
    stats.guardarTexto(c.id, texto.trim());
    stats.corta(v, tutor);
    if (c.repaso !== false) calificar(c.id, v === 'ok'); // solo ✅ cuenta como acierto
    onNext();
  };

  const pedirRevision = async () => {
    if (!evaluar) return;
    setRevisando(true); setAviso('');
    try {
      const r = await evaluar({ tipo: 'corta', prompt: c.pregunta, referencia: c.respuesta, puntos: c.puntos ?? [c.respuesta], texto, token: await authService.getAccessToken() });
      if (r.ok) { setRevision(r.evaluacion); setFase('revisada'); }
      else { setAviso(MENSAJE[r.error]); if (r.error !== 'texto-invalido') setFase('manual'); }
    } catch {
      setAviso('Sin conexión con el tutor. Compárala tú.'); setFase('manual');
    } finally {
      setRevisando(false);
    }
  };

  const referencia = (
    <div className={styles.ai}><strong>Respuesta de referencia</strong><span>{c.respuesta}</span></div>
  );

  return (
    <>
      <span className={styles.kicker}>{kicker} · respuesta corta</span>
      <h2>{c.pregunta}</h2>
      <p className={clsx(styles.muted, styles.small)}>De memoria, en 1 o 2 frases. Escríbelo o díctalo.</p>
      <textarea className={styles.textarea} style={{ minHeight: 96 }} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Mi respuesta…" readOnly={fase !== 'escribir'} />

      {fase === 'revisada' && revision && (
        <>
          <div className={styles.ai}>
            <strong>{ETIQUETA[revision.resultado]}</strong>
            {revision.comentario && <span>{revision.comentario}</span>}
            {revision.huecos.length > 0 && <ul className={styles.small}>{revision.huecos.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          </div>
          {revision.resultado !== 'ok' && referencia}
        </>
      )}
      {fase === 'manual' && referencia}
      {aviso && <p className={clsx(styles.note, styles.err)}>{aviso}</p>}

      <div className={styles.actions}>
        {fase === 'revisada' && revision ? (
          <Button onClick={() => cerrar(revision.resultado, true)}>Continuar</Button>
        ) : fase === 'manual' ? (
          <>
            <p className={styles.small}><strong>Compárala con la tuya:</strong></p>
            <div className={styles.self}>
              <button type="button" className={styles.opt} onClick={() => cerrar('ok', false)}>✅ La tenía</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('huecos', false)}>🟡 A medias</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('no', false)}>❌ No</button>
            </div>
          </>
        ) : evaluar ? (
          <>
            <Button disabled={revisando} onClick={() => void pedirRevision()}>{revisando ? 'Revisando…' : 'Que el tutor la revise'}</Button>
            <Button variant="ghost" onClick={() => setFase('manual')}>Ver respuesta y calificarme</Button>
          </>
        ) : (
          <Button onClick={() => setFase('manual')}>Ver respuesta</Button>
        )}
      </div>
    </>
  );
}
