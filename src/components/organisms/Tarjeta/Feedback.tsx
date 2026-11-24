import clsx from 'clsx';
import { Button } from '@/components/atoms/Button';
import styles from './tarjeta.module.css';

const FELICITA = ['¡Exacto! 🎯', '¡Eso es! ✨', '¡Bien hecho! 🔥', '¡Correcto! 💪'];

export function Feedback({ bien, texto, onNext }: { bien: boolean; texto?: string; onNext: () => void }) {
  return (
    <>
      <div className={clsx(styles.fb, bien ? styles.fbOk : styles.fbNo)}>
        <b>{bien ? FELICITA[(texto?.length ?? 0) % FELICITA.length] : 'Casi — mira esto'}</b>
        <span>{texto}</span>
      </div>
      <div className={styles.actions}><Button onClick={onNext}>Continuar</Button></div>
    </>
  );
}
