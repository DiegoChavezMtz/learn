// Copia el contenido C1 desde App/ (lo escribe el asesor) a Web/content/. No se edita a mano.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../App');
const dst = resolve(here, '../content');
if (!existsSync(src)) {
  // En Vercel solo existe Web/: se usa el contenido ya copiado y versionado en Web/content/.
  console.log('App/ no existe aquí: se conserva Web/content/ tal cual.');
  process.exit(0);
}
mkdirSync(dst, { recursive: true });
const files = readdirSync(src).filter((f) => /^(leccion|tema)-.+\.json$/.test(f));
for (const f of files) cpSync(resolve(src, f), resolve(dst, f));
console.log(`Contenido sincronizado: ${files.join(', ')}`);
