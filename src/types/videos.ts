/** Un video publicado de una lección (C2), con la sesión que lo desbloquea. */
export type VideoItem = {
  video: string; titulo: string; src: string;
  tema: string; temaTitulo: string; sesionId: string; sesionTitulo: string; modulo: number;
};
