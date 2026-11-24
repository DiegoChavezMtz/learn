// Mini-formato de las tarjetas: párrafos con línea en blanco, **negritas**, `código`, saltos con \n y URL https:// que se vuelven enlace (C1).
export type Trozo = { t: 'txt' | 'b' | 'code' | 'br' | 'a'; v: string };

const URL_RE = /(https?:\/\/[^\s<]+)/g;

/** Parte un texto en trozos de texto y enlaces. Los signos al final de la URL (. , ; : ) ) no son parte del enlace. */
function conEnlaces(texto: string): Trozo[] {
  const out: Trozo[] = [];
  let last = 0;
  for (const m of texto.matchAll(URL_RE)) {
    const url = m[1].replace(/[.,;:!?)\]]+$/, '');
    const i = m.index ?? 0;
    if (i > last) out.push({ t: 'txt', v: texto.slice(last, i) });
    out.push({ t: 'a', v: url });
    last = i + url.length;
  }
  if (last < texto.length) out.push({ t: 'txt', v: texto.slice(last) });
  return out;
}

export function parseRich(texto: string): Trozo[][] {
  return texto.split(/\n\n+/).map((p) => {
    const out: Trozo[] = [];
    const re = /\*\*(.+?)\*\*|`(.+?)`|\n/g;
    let last = 0;
    for (let m = re.exec(p); m; m = re.exec(p)) {
      if (m.index > last) out.push(...conEnlaces(p.slice(last, m.index)));
      if (m[1] !== undefined) out.push({ t: 'b', v: m[1] });
      else if (m[2] !== undefined) out.push({ t: 'code', v: m[2] });
      else out.push({ t: 'br', v: '' });
      last = m.index + m[0].length;
    }
    if (last < p.length) out.push(...conEnlaces(p.slice(last)));
    return out;
  });
}
