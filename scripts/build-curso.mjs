// Genera content/curso.json: el catálogo del curso (módulos y microtemas) a partir de los README de la Academia
// (solo lectura) y de las lecciones disponibles en content/leccion-*.json. Provisional: lo normal es que el asesor lo entregue (C1).
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const academia = resolve(here, '../../Infraestructura, redes y ciberseguridad/Academia');
const content = resolve(here, '../content');
const out = resolve(content, 'curso.json');

if (!existsSync(academia)) {
  console.log('Academia no existe aquí: se conserva content/curso.json tal cual.');
  process.exit(0);
}
mkdirSync(content, { recursive: true });

const limpia = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '').trim();
const campo = (md, nombre) => (md.match(new RegExp(`\\|\\s*\\*\\*${nombre}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`)) || [])[1] ?? '';
const estadoDe = (s) => (/Piloto/i.test(s) ? 'piloto' : /Listo|Desarrollado/i.test(s) ? 'listo' : 'por-desarrollar');

const lecciones = {};
for (const f of readdirSync(content)) {
  const m = f.match(/^leccion-(\d+\.\d+)\.json$/);
  if (!m) continue;
  const l = JSON.parse(readFileSync(resolve(content, f), 'utf8'));
  lecciones[m[1]] = {
    mapa: l.mapa,
    sesiones: l.sesiones.map((s) => ({ id: s.id, paso: s.paso, titulo: s.titulo, minutos: s.minutos })),
  };
}

const modulos = [];
for (const dir of readdirSync(academia).filter((d) => /^Modulo-\d+/.test(d)).sort()) {
  const md = readFileSync(resolve(academia, dir, 'README.md'), 'utf8');
  const n = Number(md.match(/^# Módulo (\d+)/m)[1]);
  const titulo = limpia(md.match(/^# Módulo \d+ · (.+)$/m)[1]);
  const requisitos = [...(campo(md, 'Requisitos previos').match(/\d+/g) ?? [])].map(Number);
  const horas = Number((campo(md, 'Tiempo de referencia').match(/~(\d+)\s*h/) || [])[1] ?? 0);
  const proyecto = limpia((md.match(/## Proyecto integrador\s+([^\n]+)/) || [])[1] ?? '');
  const temas = [];
  for (const row of md.split('\n')) {
    const c = row.split('|').map((x) => x.trim());
    if (c.length < 6 || !/^\d+\.\d+$/.test(c[1])) continue;
    const id = c[1];
    temas.push({ id, n: Number(id.split('.')[1]), titulo: limpia(c[2]), pregunta: limpia(c[3]), practica: limpia(c[4]), academia: estadoDe(c[5]), leccion: lecciones[id] ?? null });
  }
  modulos.push({ n, titulo, objetivo: limpia(campo(md, 'Objetivo')), requisitos, horas, proyecto, temas });
}
modulos.sort((a, b) => a.n - b.n);
const total = modulos.reduce((s, m) => s + m.temas.length, 0);
writeFileSync(out, JSON.stringify({ titulo: 'Infraestructura de TI, redes y ciberseguridad', modulos }, null, 1) + '\n');
console.log(`curso.json: ${modulos.length} módulos, ${total} microtemas, ${Object.keys(lecciones).length} con lección en tarjetas`);
