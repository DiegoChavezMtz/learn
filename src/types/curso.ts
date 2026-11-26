import type { Paso } from './lesson';

export type SesionResumen = { id: string; paso: Paso; titulo: string; minutos: number };
export type LeccionResumen = { mapa: string[]; sesiones: SesionResumen[]; /** ids de las tarjetas que entran al repaso (las que pueden estar vencidas). */ repasables?: string[] };

export type TemaCurso = {
  id: string; n: number; titulo: string; pregunta: string; practica: string;
  academia: 'piloto' | 'listo' | 'por-desarrollar';
  /** null = todavía no hay lección en tarjetas: el tema se ve como "Pronto". */
  leccion: LeccionResumen | null;
};

export type ModuloCurso = {
  n: number; titulo: string; objetivo: string; requisitos: number[]; horas: number; proyecto: string; temas: TemaCurso[];
};

export type Curso = { titulo: string; modulos: ModuloCurso[] };
