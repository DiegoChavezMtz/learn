// Esquema C1 (Equipo/contratos.md). Lo comparten varias features, por eso vive en src/types.
export type Paso = 'Orientar' | 'Exponer' | 'Practicar' | 'Explicar' | 'Consolidar' | 'Registrar';
export type Visual = 'viaje' | 'cablewifi' | 'problemas' | 'paqueteria' | 'torre';

/** `concepto` (v0.13, D39): lo que mide la tarjeta. Lo usan el historial de intentos y el estado por concepto. */
type Base = { id: string; concepto?: string };

export type Tarjeta = Base &
  (
    | { tipo: 'concepto'; titulo: string; texto: string; visual?: Visual; capa?: number }
    | { tipo: 'video'; video: string; titulo: string; archivo: string; src: string; subs?: string }
    | { tipo: 'opcion'; pregunta: string; opciones: string[]; correcta: number; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'vf'; afirmacion: string; verdadera: boolean; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'orden'; pregunta: string; items: string[]; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'emparejar'; pregunta: string; pares: [string, string][]; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'clasificar'; pregunta: string; grupos: string[]; items: { texto: string; grupo: number }[]; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'armar'; pregunta: string; piezas: string[]; distractores?: string[]; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'error'; pregunta: string; partes: string[]; incorrecta: number; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'preprueba'; pregunta: string; opciones: string[]; correcta: number }
    | { tipo: 'reflexion'; pregunta: string; opciones: string[]; nota?: string }
    | { tipo: 'abierta'; pregunta: string; opcional?: boolean }
    | { tipo: 'corta'; pregunta: string; respuesta: string; puntos?: string[]; pista?: string; repaso?: boolean; capa?: number }
    | { tipo: 'explica'; prompt: string; puntos: string[]; segundos?: number; repaso?: boolean; capa?: number }
    /** Tutor conversacional (v0.13). Aún no lo reproduce la web: se omite con aviso en el catálogo de sesiones. */
    | { tipo: 'conversa'; objetivo: string; preguntas: number; conceptos?: string[]; puntos: string[] }
  );

export type Sesion = { id: string; paso: Paso; titulo: string; minutos: number; libro?: string; tarjetas: Tarjeta[] };

export type Leccion = {
  tema: string; titulo: string; modulo: string; pregunta: string;
  mapa: string[]; sesiones: Sesion[];
  /** v0.13: conceptos que mide el tema y diagnóstico en tres momentos (se usan en las próximas entregas). */
  conceptos?: { id: string; nombre: string }[];
  diagnostico?: { inicial?: Tarjeta[]; final?: Tarjeta[]; retencion?: Tarjeta[] };
};

// Libro del microtema (App/tema-X.Y.json, generado con build.py)
export type SesionLibro = { id: string; paso: string; titulo: string; md: string; miniPrompt?: string };
export type Libro = { tema: string; titulo: string; modulo: string; pregunta: string; sesiones: SesionLibro[] };

/** Lo que el reproductor necesita para pintar una tarjeta. `sesion` es el id de la sesión de origen (para el historial). */
export type ItemTarjeta = { tarjeta: Tarjeta; paso: Paso; sesion?: string; repaso?: boolean; libre?: boolean };
