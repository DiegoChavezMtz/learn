'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import { useProgreso } from '@/context/ProgresoContext';
import { authService } from '@/services/auth.service';
import type { Tarjeta } from '@/types/lesson';
import type { Evaluacion, ResultadoCorta } from '@/types/progreso';
import styles from './tarjeta.module.css';
import type { CardProps } from './types';

const ETIQUETA: Record<ResultadoCorta, string> = {
  ok: '✅ Correcta a la primera',
  ayuda: '✅ Bien tras la pista',
  huecos: '🟡 A medias',
  no: '❌ Todavía no',
};
const MENSAJE = {
  'sin-sesion': 'Inicia sesión en Cuenta para usar el tutor. Compárala tú.',
  'no-disponible': 'El tutor no está disponible ahora. Compárala tú.',
  'texto-invalido': 'Escribe tu respuesta primero (de 3 a 800 caracteres).',
} as const;

/**
 * Respuesta corta (C1 v0.13): primer intento → el tutor dice qué estuvo bien, qué falta y da una pista →
 * segundo intento → respuesta de referencia. Sin tutor, la persona se compara con la referencia y se califica.
 * Resultado: ok (a la primera), ayuda (bien tras la pista), huecos o no. Cada intento queda en el historial.
 */
export function Corta({ tarjeta: c, kicker, onNext, stats, evaluar }: CardProps<Extract<Tarjeta, { tipo: 'corta' }>>) {
  const { calificarCorta } = useProgreso();
  type Fase = 'escribir' | 'pista' | 'reintento' | 'final' | 'manual';
  const [fase, setFase] = useState<Fase>('escribir');
  const [texto, setTexto] = useState('');        // primer intento
  const [texto2, setTexto2] = useState('');      // segundo intento (tras la pista)
  const [r1, setR1] = useState<Evaluacion | null>(null);
  const [final, setFinal] = useState<{ v: ResultadoCorta; ev: Evaluacion | null } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  const pista = c.pista ?? r1?.pista;

  const pedir = async (t: string, pistaDada?: string): Promise<Evaluacion | null> => {
    if (!evaluar) return null;
    const r = await evaluar({
      tipo: 'corta', prompt: c.pregunta, referencia: c.respuesta, puntos: c.puntos ?? [c.respuesta],
      texto: t, pista: pistaDada, token: await authService.getAccessToken(),
    });
    if (r.ok) return r.evaluacion;
    setAviso(MENSAJE[r.error]);
    if (r.error !== 'texto-invalido') setFase('manual');
    return null;
  };

  const revisar = async () => {
    setOcupado(true); setAviso('');
    try {
      const ev = await pedir(texto.trim());
      if (!ev) return;
      setR1(ev);
      stats.intento(ev.resultado, texto.trim());
      if (ev.resultado === 'ok') { setFinal({ v: 'ok', ev }); setFase('final'); } else setFase('pista');
    } catch {
      setAviso('Sin conexión con el tutor. Compárala tú.'); setFase('manual');
    } finally {
      setOcupado(false);
    }
  };

  const reintentar = async () => {
    setOcupado(true); setAviso('');
    try {
      const ev = await pedir(texto2.trim(), pista);
      if (!ev) return;
      const v: ResultadoCorta = ev.resultado === 'ok' ? 'ayuda' : ev.resultado;
      stats.intento(v, texto2.trim());
      setFinal({ v, ev });
      setFase('final');
    } catch {
      setAviso('Sin conexión con el tutor. Compárala tú.'); setFase('manual');
    } finally {
      setOcupado(false);
    }
  };

  const verRespuesta = () => {
    if (r1) setFinal({ v: r1.resultado, ev: r1 });
    setFase(r1 ? 'final' : 'manual');
  };

  // Cierra la tarjeta. Sin tutor, el intento se anota aquí (con el tutor ya se anotó en cada intento).
  const cerrar = (v: ResultadoCorta, tutor: boolean) => {
    stats.guardarTexto(c.id, texto.trim());
    if (!tutor) stats.intento(v, (r1 ? texto2 : texto).trim());
    stats.corta(v, tutor);
    if (c.repaso !== false) calificarCorta(c.id, v); // solo lo calificado cuenta; en práctica libre no mueve el repaso
    onNext();
  };

  const referencia = (
    <div className={styles.ai}><strong>Respuesta de referencia</strong><span>{c.respuesta}</span></div>
  );
  const bloquePista = pista && (
    <div className={styles.ai}><strong>Pista</strong><span>{pista}</span></div>
  );
  const editable = fase === 'escribir';

  return (
    <>
      <span className={styles.kicker}>{kicker} · respuesta corta</span>
      <h2>{c.pregunta}</h2>
      {fase === 'escribir' && <p className={clsx(styles.muted, styles.small)}>De memoria, en 1 o 2 frases. Escríbelo o díctalo.</p>}
      <textarea
        className={styles.textarea} style={{ minHeight: 96 }} value={texto} readOnly={!editable}
        onChange={(e) => setTexto(e.target.value)} placeholder="Mi respuesta…"
      />

      {(fase === 'pista' || fase === 'reintento') && r1 && (
        <div className={styles.ai}>
          <strong>{ETIQUETA[r1.resultado]}</strong>
          {r1.bien.length > 0 && <ul className={styles.small}>{r1.bien.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          {r1.comentario && <span>{r1.comentario}</span>}
          {r1.huecos.length > 0 && <span><strong>Te falta:</strong> {r1.huecos.join(' ')}</span>}
        </div>
      )}
      {(fase === 'pista' || fase === 'reintento') && bloquePista}

      {fase === 'reintento' && (
        <>
          <p className={clsx(styles.muted, styles.small)}>Segundo intento, con la pista en mente.</p>
          <textarea className={styles.textarea} style={{ minHeight: 96 }} value={texto2} onChange={(e) => setTexto2(e.target.value)} placeholder="Ahora, tu segunda respuesta…" />
        </>
      )}

      {fase === 'final' && final && (
        <>
          <div className={styles.ai}>
            <strong>{ETIQUETA[final.v]}</strong>
            {final.ev?.comentario && <span>{final.ev.comentario}</span>}
            {final.ev && final.ev.huecos.length > 0 && <ul className={styles.small}>{final.ev.huecos.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          </div>
          {final.v !== 'ok' && referencia}
        </>
      )}
      {fase === 'manual' && referencia}
      {aviso && <p className={clsx(styles.note, styles.err)}>{aviso}</p>}

      <div className={styles.actions}>
        {fase === 'escribir' && (
          evaluar ? (
            <>
              <Button disabled={ocupado} onClick={() => void revisar()}>{ocupado ? 'Revisando…' : 'Que el tutor la revise'}</Button>
              <Button variant="ghost" onClick={() => setFase('manual')}>Ver respuesta y calificarme</Button>
            </>
          ) : (
            <Button onClick={() => setFase('manual')}>Ver respuesta</Button>
          )
        )}
        {fase === 'pista' && (
          <>
            <Button onClick={() => setFase('reintento')}>Intentarlo otra vez</Button>
            <Button variant="ghost" onClick={verRespuesta}>Ver respuesta</Button>
          </>
        )}
        {fase === 'reintento' && (
          <>
            <Button disabled={ocupado || !texto2.trim()} onClick={() => void reintentar()}>{ocupado ? 'Revisando…' : 'Enviar segundo intento'}</Button>
            <Button variant="ghost" onClick={verRespuesta}>Ver respuesta</Button>
          </>
        )}
        {fase === 'final' && final && (
          <Button onClick={() => cerrar(final.v, true)}>Continuar</Button>
        )}
        {fase === 'manual' && (
          <>
            <p className={styles.small}><strong>Compárala con la tuya:</strong></p>
            <div className={styles.self}>
              <button type="button" className={styles.opt} onClick={() => cerrar('ok', false)}>✅ La tenía</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('huecos', false)}>🟡 A medias</button>
              <button type="button" className={styles.opt} onClick={() => cerrar('no', false)}>❌ No</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
