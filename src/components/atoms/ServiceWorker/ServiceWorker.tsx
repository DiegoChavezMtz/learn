'use client';
import { useEffect } from 'react';

/** Registra el service worker (solo en producción: en desarrollo cachearía código viejo). No pinta nada. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => { /* sin SW la app sigue funcionando en línea */ });
  }, []);
  return null;
}
