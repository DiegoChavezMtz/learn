import { marked } from 'marked';

/** Markdown del libro → HTML. Los enlaces relativos (rutas del repositorio) se vuelven texto; los https se abren fuera. */
export function renderLibro(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  return html
    .replace(/<a href="(?!https?:)[^"]*"[^>]*>(.*?)<\/a>/g, '$1')
    .replace(/<a href="(https?:[^"]*)"/g, '<a target="_blank" rel="noopener" href="$1"');
}
