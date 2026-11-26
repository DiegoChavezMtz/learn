// Almacén externo del progreso del curso (un Progreso por microtema). La app siempre lee y escribe aquí (offline primero).
// La sincronización con Supabase (services/sync.service.ts) lee y escribe este mismo almacén.
import type { Intento, Progreso, Registro } from '@/types/progreso';
import { mergeProgreso } from '@/utils/mergeProgreso';
import { readJson, writeJson } from './localStorage';

export type Todos = Record<string, Progreso>;

const key = (tema: string) => `app-${tema}`;
const keyRegs = (tema: string) => `${key(tema)}-registros`;   // todos los registros C3 de este dispositivo, por sesión
const keyPend = (tema: string) => `${key(tema)}-pendientes`;  // sesiones cuyo registro aún no se envía a la nube
const keyIntentos = (tema: string) => `${key(tema)}-intentos`; // historial C3: una fila por respuesta (solo se agrega)
export const vacio = (): Progreso => ({ sesiones: {}, repaso: {}, dias: [], preprueba: {}, actualizado: null });

let state: Todos | null = null;
const listeners = new Set<() => void>();      // React (cualquier cambio)
const localListeners = new Set<() => void>(); // sincronización (solo cambios hechos aquí, no los que vienen de la nube)

const emit = (local: boolean) => {
  listeners.forEach((l) => l());
  if (local) localListeners.forEach((l) => l());
};

function cargar(): Todos {
  const todos: Todos = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i) ?? '';
    const m = k.match(/^app-(\d+\.\d+)$/);
    if (m) todos[m[1]] = { ...vacio(), ...readJson<Partial<Progreso>>(k, {}) };
  }
  return todos;
}

export const progressStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  onLocalChange(l: () => void) {
    localListeners.add(l);
    return () => { localListeners.delete(l); };
  },
  getSnapshot(): Todos | null {
    if (typeof window === 'undefined') return null;
    if (!state) state = cargar();
    return state;
  },
  getServerSnapshot: (): Todos | null => null,
  temas: (): string[] => Object.keys(progressStore.getSnapshot() ?? {}),

  update(tema: string, fn: (p: Progreso) => Progreso) {
    const cur = progressStore.getSnapshot();
    if (!cur) return;
    const nuevo = { ...fn(cur[tema] ?? vacio()), actualizado: new Date().toISOString() };
    state = { ...cur, [tema]: nuevo };
    writeJson(key(tema), nuevo);
    emit(true);
  },
  /** Aplica el resultado de unir con la nube. No cuenta como cambio local. */
  aplicarRemoto(tema: string, p: Progreso) {
    const cur = progressStore.getSnapshot() ?? {};
    state = { ...cur, [tema]: p };
    writeJson(key(tema), p);
    emit(false);
  },
  /** Une un progreso externo (nube o archivo) con el del dispositivo. */
  unir(tema: string, otro: Partial<Progreso>, local = true): Progreso | null {
    const cur = progressStore.getSnapshot();
    if (!cur) return null;
    const merged = mergeProgreso(cur[tema] ?? vacio(), { ...vacio(), ...otro });
    state = { ...cur, [tema]: merged };
    writeJson(key(tema), merged);
    emit(local);
    return merged;
  },

  // ---- registros C3 ----
  registros: (tema: string): Record<string, Registro> => readJson<Record<string, Registro>>(keyRegs(tema), {}),
  pendientes: (tema: string): string[] => readJson<string[]>(keyPend(tema), []),
  guardarRegistro(r: Registro, pendiente = true) {
    writeJson(keyRegs(r.tema), { ...progressStore.registros(r.tema), [r.sesion]: r });
    if (pendiente) writeJson(keyPend(r.tema), [...new Set([...progressStore.pendientes(r.tema), r.sesion])]);
    emit(pendiente);
  },
  marcarEnviado(tema: string, sesion: string) {
    writeJson(keyPend(tema), progressStore.pendientes(tema).filter((s) => s !== sesion));
  },

  /** Reinicio (D40): borra un tema en este dispositivo (estado, registros, pendientes e historial). Se llama después del respaldo y de borrar en la nube. */
  borrarTema(tema: string) {
    for (const k of [key(tema), keyRegs(tema), keyPend(tema), keyIntentos(tema)]) {
      try { window.localStorage.removeItem(k); } catch { /* sin acceso a almacenamiento: queda en memoria */ }
    }
    const cur = progressStore.getSnapshot();
    if (cur) {
      const resto = { ...cur };
      delete resto[tema];
      state = resto;
    }
    emit(false);
  },

  // ---- historial de intentos (C3, D39) ----
  intentos: (tema: string): Intento[] => readJson<Intento[]>(keyIntentos(tema), []),
  guardarIntento(fila: Intento) {
    writeJson(keyIntentos(fila.tema), [...progressStore.intentos(fila.tema), fila]);
  },
};
