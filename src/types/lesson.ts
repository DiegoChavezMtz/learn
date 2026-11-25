// Esquema C1 (Equipo/contratos.md). Lo comparten varias features, por eso vive en src/types.
export type Paso = 'Orientar' | 'Exponer' | 'Practicar' | 'Explicar' | 'Consolidar' | 'Registrar';
export type Visual = 'viaje' | 'cablewifi' | 'problemas' | 'paqueteria' | 'torre';

type Base = { id: string };

export type Tarjeta = Base &
  (
    | { tipo: 'concepto'; titulo: string; texto: string; visual?: Visual; capa?: number }
    | { tipo: 'video'; video: string; titulo: string; archivo: string; src: string; subs?: string }
    | { tipo: 'opcion'; pregunta: string; opciones: string[]; correcta: number; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'vf'; afirmacion: string; verdadera: boolean; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'orden'; pregunta: string; items: string[]; explica: string; repaso?: boolean; capa?: number }
    | { tipo: 'preprueba'; pregunta: string; opciones: string[]; correcta: number }
    | { tipo: 'reflexion'; pregunta: string; opciones: string[]; nota?: string }
    | { tipo: 'abierta'; pregunta: string; opcional?: boolean }
    | { tipo: 'corta'; pregunta: string; respuesta: string; puntos?: string[]; repaso?: boolean; capa?: number }
    | { tipo: 'explica'; prompt: string; puntos: string[]; segundos?: number; repaso?: boolean; capa?: number }
  );

export type Sesion = { id: string; paso: Paso; titulo: string; minutos: number; tarjetas: Tarjeta[] };

export type Leccion = {
  tema: string; titulo: string; modulo: string; pregunta: string;
  mapa: string[]; sesiones: Sesion[];
};

// Libro del microtema (App/tema-X.Y.json, generado con build.py)
export type SesionLibro = { id: string; paso: string; titulo: string; md: string; miniPrompt?: string };
export type Libro = { tema: string; titulo: string; modulo: string; pregunta: string; sesiones: SesionLibro[] };

/** Lo que el reproductor necesita para pintar una tarjeta. */
export type ItemTarjeta = { tarjeta: Tarjeta; paso: Paso; repaso?: boolean; libre?: boolean };
