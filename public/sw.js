/* Service worker de Aprender: la app, las lecciones y los videos del día funcionan sin conexión.
   - /_next/static y /icons: caché primero (los archivos llevan hash).
   - Páginas: red primero (máx. 4 s) y, si falla, la copia guardada.
   - Videos: se guardan con un mensaje {type:'media'} y se sirven con soporte de Range (iOS lo exige).
   - Mensaje {type:'warm'}: baja las páginas y los archivos que necesitan, para la primera vez sin red. */
const V = 'v2';
const STATIC = `aprender-static-${V}`;
const PAGES = `aprender-pages-${V}`;
const MEDIA = 'aprender-media-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (![STATIC, PAGES, MEDIA].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const pageKey = (url) => new Request(url.origin + url.pathname);

async function cachePut(name, req, res) {
  if (res && res.ok) await (await caches.open(name)).put(req, res.clone());
  return res;
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

async function mediaResponse(req) {
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(req.url);
  if (!hit) return null;
  const range = req.headers.get('range');
  if (!range) return hit;
  const buf = await hit.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Videos guardados (también de otro origen, p. ej. el almacenamiento de Supabase).
  if (req.destination === 'video' || req.destination === 'audio' || req.destination === 'track') {
    event.respondWith((async () => (await mediaResponse(req)) || fetch(req))());
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith((async () => (await caches.match(req)) || cachePut(STATIC, req, await fetch(req)))());
    return;
  }

  // Las peticiones RSC de la navegación interna se dejan pasar: si fallan sin red, Next hace una navegación completa,
  // y esa sí la sirve la copia guardada.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const key = pageKey(url);
      try {
        return await cachePut(PAGES, key, await withTimeout(fetch(req), 4000));
      } catch {
        return (await caches.match(key)) || (await caches.match(pageKey(new URL('/', url)))) || Response.error();
      }
    })());
  }
});

const assetsDe = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/(?:\/_next\/)?(static\/[A-Za-z0-9_\-./~%[\]]+\.(?:js|css|woff2?))/g)) out.add('/_next/' + m[1]);
  return [...out];
};

async function warm(paths) {
  const assets = new Set();
  for (const p of paths) {
    try {
      const url = new URL(p, self.location.origin);
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) continue;
      await (await caches.open(PAGES)).put(pageKey(url), res.clone());
      assetsDe(await res.text()).forEach((a) => assets.add(a));
    } catch { /* sin red: se reintenta en la próxima visita */ }
  }
  const cache = await caches.open(STATIC);
  for (const a of assets) {
    try { if (!(await cache.match(a))) await cache.add(a); } catch { /* idem */ }
  }
}

async function guardarMedia(urls) {
  const cache = await caches.open(MEDIA);
  for (const u of urls) {
    try { if (!(await cache.match(u))) await cache.add(new Request(u, { mode: 'cors' })); } catch { /* sin red o sin CORS: se verá en línea */ }
  }
}

self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type === 'warm' && Array.isArray(d.paths)) event.waitUntil(warm(d.paths));
  if (d.type === 'media' && Array.isArray(d.urls)) event.waitUntil(guardarMedia(d.urls));
});
