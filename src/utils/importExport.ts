import type { Intento, Progreso, Registro } from '@/types/progreso';

export const FORMATO = 'aprender-export-2';

export type Archivo =
  | { tipo: 'estado'; datos: Partial<Progreso> }
  | { tipo: 'registro'; registro: Registro }
  | { tipo: 'paquete'; estados: Record<string, Partial<Progreso>>; registros: Registro[] };

const esObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Reconoce qué es un JSON: estado de un tema (C4), registro de una sesión (C3) o un paquete exportado por la app. */
export function clasificar(json: unknown): Archivo | null {
  if (!esObj(json)) return null;
  if (json.formato === FORMATO && esObj(json.estados) && Array.isArray(json.registros)) {
    return { tipo: 'paquete', estados: json.estados as Record<string, Partial<Progreso>>, registros: json.registros as Registro[] };
  }
  // Formato 1 (un solo tema): { formato, tema, estado, registros }
  if (json.formato === 'aprender-export-1' && esObj(json.estado) && Array.isArray(json.registros)) {
    return { tipo: 'paquete', estados: { [String(json.tema ?? '')]: json.estado as Partial<Progreso> }, registros: json.registros as Registro[] };
  }
  if (typeof json.tema === 'string' && typeof json.sesion === 'string') return { tipo: 'registro', registro: json as unknown as Registro };
  if (Array.isArray(json.dias) && esObj(json.repaso)) return { tipo: 'estado', datos: json as Partial<Progreso> };
  return null;
}

/** El estado exportado del artefacto no trae el tema dentro: se saca del nombre del archivo ("1.1.json"). */
export const temaDeNombre = (nombre: string): string | null => nombre.match(/(\d+\.\d+)/)?.[1] ?? null;

/** `intentos` (C3, D39): historial de cada respuesta. Es una clave nueva y opcional: los archivos anteriores siguen válidos. */
export function paqueteDeExportacion(estados: Record<string, Progreso>, registros: Registro[], intentos: Intento[] = []) {
  return { formato: FORMATO, generado: new Date().toISOString(), estados, registros, intentos };
}
