'use client';
import { useEffect } from 'react';
import { readJson, writeJson } from '@/lib/localStorage';

const SEIS_HORAS = 6 * 3600 * 1000;

/** Pide al service worker que guarde estas páginas y videos para usarlos sin conexión (como mucho cada 6 horas por lista). */
export function useOfflineWarm(paths: string[], media: string[]) {
  const key = JSON.stringify([paths, media]);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const [p, m] = JSON.parse(key) as [string[], string[]];
    const huella = `${p.length}:${m.join('|')}:${p[p.length - 1] ?? ''}`;
    const ultimo = readJson<{ huella: string; t: number }>('aprender-warm', { huella: '', t: 0 });
    const reciente = ultimo.huella === huella && Date.now() - ultimo.t < SEIS_HORAS;
    navigator.serviceWorker.ready.then((reg) => {
      if (!reg.active) return;
      if (!reciente && p.length) { reg.active.postMessage({ type: 'warm', paths: p }); writeJson('aprender-warm', { huella, t: Date.now() }); }
      if (m.length) reg.active.postMessage({ type: 'media', urls: m });
    }).catch(() => {});
  }, [key]);
}
