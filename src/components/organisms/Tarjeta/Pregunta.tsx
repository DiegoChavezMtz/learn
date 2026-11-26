import { parseRich } from '@/utils/richText';

/** Texto en línea con **negritas** (el mismo formato que el resto del contenido). Para títulos y opciones. */
export function Inline({ texto }: { texto: string }) {
  return (
    <>
      {parseRich(texto).flat().map((t, k) => (t.t === 'b' ? <strong key={k}>{t.v}</strong> : <span key={k}>{t.v}</span>))}
    </>
  );
}

/** Título de una tarjeta de puzzle. */
export function Pregunta({ texto }: { texto: string }) {
  return <h2><Inline texto={texto} /></h2>;
}
