import { parseRich } from '@/utils/richText';
import styles from './RichText.module.css';

export function RichText({ texto }: { texto: string }) {
  return (
    <div className={styles.root}>
      {parseRich(texto).map((p, i) => (
        <p key={i}>
          {p.map((t, k) =>
            t.t === 'b' ? <strong key={k}>{t.v}</strong>
            : t.t === 'code' ? <code key={k}>{t.v}</code>
            : t.t === 'br' ? <br key={k} />
            : t.t === 'a' ? <a key={k} href={t.v} target="_blank" rel="noopener noreferrer">{t.v}</a>
            : t.v,
          )}
        </p>
      ))}
    </div>
  );
}
