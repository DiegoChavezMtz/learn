'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { progressStore } from '@/lib/progressStore';
import { authService } from '@/services/auth.service';
import { syncService } from '@/services/sync.service';

export type EstadoSync = 'sin-config' | 'sin-sesion' | 'sincronizando' | 'ok' | 'error';
type SyncCtx = { estado: EstadoSync; email: string; sincronizar: () => Promise<void> };
const Ctx = createContext<SyncCtx | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoSync>(() => (authService.disponible() ? 'sin-sesion' : 'sin-config'));
  const [email, setEmail] = useState('');
  const corriendo = useRef(false);
  const otraVez = useRef(false);

  const sincronizar = useCallback(async () => {
    if (corriendo.current) { otraVez.current = true; return; }
    corriendo.current = true;
    try {
      do {
        otraVez.current = false;
        setEstado((e) => (e === 'sin-config' ? e : 'sincronizando'));
        const r = await syncService.sincronizar();
        setEstado(r === 'ok' ? 'ok' : r === 'sin-sesion' ? 'sin-sesion' : 'sin-config');
      } while (otraVez.current);
    } catch {
      setEstado('error'); // sin red o la nube no responde: todo queda en el dispositivo y se reintenta
    } finally {
      corriendo.current = false;
    }
  }, []);

  useEffect(() => {
    if (!authService.disponible()) return;
    let vivo = true;
    authService.getSession().then((s) => { if (vivo && s) { setEmail(s.email); void sincronizar(); } });
    const off = authService.onChange((s) => {
      setEmail(s?.email ?? '');
      if (s) void sincronizar(); else setEstado('sin-sesion');
    });
    return () => { vivo = false; off(); };
  }, [sincronizar]);

  // Cambios hechos aquí → enviar poco después; al volver la conexión → sincronizar.
  useEffect(() => {
    if (!authService.disponible()) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const off = progressStore.onLocalChange(() => { clearTimeout(t); t = setTimeout(() => void sincronizar(), 2000); });
    const online = () => void sincronizar();
    window.addEventListener('online', online);
    return () => { off(); clearTimeout(t); window.removeEventListener('online', online); };
  }, [sincronizar]);

  const value = useMemo(() => ({ estado, email, sincronizar }), [estado, email, sincronizar]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSync(): SyncCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSync debe usarse dentro de SyncProvider');
  return c;
}
