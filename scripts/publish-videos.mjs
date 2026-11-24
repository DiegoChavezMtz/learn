// Publica los videos 🔗 (integrados) de Contenido/**/media en Cloudflare R2 y registra sus URLs en content/videos.json (C2).
//   npm run publish:videos            → comprime a 720p, sube lo nuevo o cambiado y actualiza videos.json
//   npm run publish:videos -- --dry   → solo comprime y muestra tamaños; no sube nada ni necesita llaves
//   npm run publish:videos -- --dry --archivo ruta.mp4   → prueba la compresión con un MP4 cualquiera
// Contenido/ es de solo lectura: aquí nunca se escribe. Las llaves salen del entorno (.env.local), nunca del código.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = dirname(fileURLToPath(import.meta.url));
const contenido = resolve(here, '../../Contenido');
const registro = resolve(here, '../content/videos.json');
if (!existsSync(contenido)) { console.log('No existe Contenido/ aquí: nada que publicar.'); process.exit(0); }

// 1) Videos integrados (🔗) según los README de media/ (contrato C2: solo estos aparecen en la app)
const fuentes = [];
const recorre = (dir) => {
  for (const n of readdirSync(dir)) {
    if (n === '_produccion' || n.startsWith('.') || n === 'node_modules') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n === 'media') leeMedia(p); else recorre(p); }
  }
};
const leeMedia = (media) => {
  const readme = join(media, 'README.md');
  if (!existsSync(readme)) return;
  for (const fila of readFileSync(readme, 'utf8').split('\n')) {
    const id = fila.match(/^\|\s*(V\d+)\b/)?.[1];
    const mp4 = fila.match(/\[([^\]]+\.mp4)\]/)?.[1];
    if (!id || !mp4 || !/🔗/.test(fila)) continue;
    const srt = mp4.replace(/\.mp4$/, '.srt');
    fuentes.push({ id, mp4: join(media, mp4), srt: existsSync(join(media, srt)) ? join(media, srt) : null });
  }
};
const unico = process.argv.includes('--archivo') ? process.argv[process.argv.indexOf('--archivo') + 1] : null;
if (unico) fuentes.push({ id: basename(unico, '.mp4'), mp4: resolve(unico), srt: null });
else recorre(contenido);
if (!fuentes.length) { console.log('No hay videos marcados 🔗 Integrado.'); process.exit(0); }

const previo = existsSync(registro) ? JSON.parse(readFileSync(registro, 'utf8')) : {};
const huella = (...files) => { const h = createHash('sha256'); files.filter(Boolean).forEach((f) => h.update(readFileSync(f))); return h.digest('hex').slice(0, 12); };
const srtAVtt = (srt) => 'WEBVTT\n\n' + srt.replace(/\r/g, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;

let s3 = null, bucket, base;
if (!dry) {
  const falta = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'].filter((k) => !process.env[k]);
  if (falta.length) { console.error(`Faltan variables en .env.local: ${falta.join(', ')}. Ver Web/R2.md. (Usa --dry para probar sin subir.)`); process.exit(1); }
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  s3 = { client: new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } }), Put: PutObjectCommand };
  bucket = process.env.R2_BUCKET; base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
}
const subir = (key, body, type) => s3.client.send(new s3.Put({ Bucket: bucket, Key: key, Body: body, ContentType: type, CacheControl: 'public, max-age=31536000, immutable' }));

// La orientación manda: vertical (9:16, D22) → 720 × 1280; horizontal → 1280 × 720. Nunca se gira ni se recorta.
const dimensiones = (f) => {
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', f]).toString().trim().split('x').map(Number);
  return { w, h, vertical: h > w };
};
const filtroEscala = (f) => (dimensiones(f).vertical ? 'scale=720:-2' : 'scale=-2:720');
const tmp = mkdtempSync(join(tmpdir(), 'aprender-videos-'));
for (const f of fuentes) {
  const h = huella(f.mp4, f.srt);
  if (!dry && previo[f.id]?.huella === h) { console.log(`${f.id}: sin cambios`); continue; }
  const out = join(tmp, `${f.id}.mp4`);
  // 720p, H.264 + AAC, "faststart" para que empiece a verse sin bajar todo (y para iOS)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f.mp4, '-vf', filtroEscala(f.mp4), '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out]);
  const d = dimensiones(out);
  console.log(`${f.id}: ${mb(statSync(f.mp4).size)} → ${mb(statSync(out).size)} (${d.w}×${d.h}${d.vertical ? ', vertical' : ''})`);
  if (dry) continue;
  const key = `videos/${f.id}-${h}`;
  await subir(`${key}.mp4`, readFileSync(out), 'video/mp4');
  let subs = null;
  if (f.srt) { await subir(`${key}.vtt`, srtAVtt(readFileSync(f.srt, 'utf8')), 'text/vtt; charset=utf-8'); subs = `${base}/${key}.vtt`; }
  previo[f.id] = { src: `${base}/${key}.mp4`, subs, huella: h, fuente: basename(f.mp4) };
  console.log(`${f.id}: publicado → ${previo[f.id].src}`);
}
if (!dry) { mkdirSync(dirname(registro), { recursive: true }); writeFileSync(registro, JSON.stringify(previo, null, 1) + '\n'); console.log('content/videos.json actualizado.'); }
