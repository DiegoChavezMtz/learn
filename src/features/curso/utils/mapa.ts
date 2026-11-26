import type { ModuloCurso, TemaCurso } from '@/types/curso';
import type { Progreso } from '@/types/progreso';

export const PALETA_TEMAS = [
  { primario: '#4f8cff', fondo: 'rgba(79, 140, 255, 0.16)', borde: '#7aa2ff', glow: 'rgba(79, 140, 255, 0.4)' },
  { primario: '#10b981', fondo: 'rgba(16, 185, 129, 0.16)', borde: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' },
  { primario: '#f59e0b', fondo: 'rgba(245, 158, 11, 0.16)', borde: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' },
  { primario: '#ec4899', fondo: 'rgba(236, 72, 153, 0.16)', borde: '#f472b6', glow: 'rgba(236, 72, 153, 0.4)' },
  { primario: '#8b5cf6', fondo: 'rgba(139, 92, 246, 0.16)', borde: '#a78bfa', glow: 'rgba(139, 92, 246, 0.4)' },
  { primario: '#06b6d4', fondo: 'rgba(6, 182, 212, 0.16)', borde: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)' },
  { primario: '#f97316', fondo: 'rgba(249, 115, 22, 0.16)', borde: '#fb923c', glow: 'rgba(249, 115, 22, 0.4)' },
  { primario: '#14b8a6', fondo: 'rgba(20, 184, 166, 0.16)', borde: '#2dd4bf', glow: 'rgba(20, 184, 166, 0.4)' },
  { primario: '#e11d48', fondo: 'rgba(225, 29, 72, 0.16)', borde: '#fb7185', glow: 'rgba(225, 29, 72, 0.4)' },
  { primario: '#84cc16', fondo: 'rgba(132, 204, 22, 0.16)', borde: '#a3e635', glow: 'rgba(132, 204, 22, 0.4)' },
  { primario: '#6366f1', fondo: 'rgba(99, 102, 241, 0.16)', borde: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' },
  { primario: '#d946ef', fondo: 'rgba(217, 70, 239, 0.16)', borde: '#e879f9', glow: 'rgba(217, 70, 239, 0.4)' },
];

export function colorDeTema(indiceTema: number) {
  return PALETA_TEMAS[Math.abs(indiceTema) % PALETA_TEMAS.length];
}

export type TipoPedagogico = 'exploracion' | 'contenido' | 'practica' | 'explicar' | 'consolidar' | 'repaso';

export type InfoTipoLeccion = {
  tipo: TipoPedagogico;
  nombre: string;
  color: string;
  fondo: string;
  borde: string;
  glow: string;
  icono: string;
};

export const COLORES_TIPO_LECCION: Record<string, InfoTipoLeccion> = {
  Orientar: {
    tipo: 'exploracion',
    nombre: 'Exploración',
    color: '#a855f7', // Púrpura eléctrico
    fondo: 'rgba(168, 85, 247, 0.18)',
    borde: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.45)',
    icono: '🧭',
  },
  Exponer: {
    tipo: 'contenido',
    nombre: 'Contenido',
    color: '#0ea5e9', // Azul cian
    fondo: 'rgba(14, 165, 233, 0.18)',
    borde: '#38bdf8',
    glow: 'rgba(14, 165, 233, 0.45)',
    icono: '📖',
  },
  Practicar: {
    tipo: 'practica',
    nombre: 'Práctica',
    color: '#f97316', // Naranja fuego
    fondo: 'rgba(249, 115, 22, 0.18)',
    borde: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.45)',
    icono: '⚡',
  },
  Explicar: {
    tipo: 'explicar',
    nombre: 'Técnica Feynman',
    color: '#10b981', // Verde esmeralda
    fondo: 'rgba(16, 185, 129, 0.18)',
    borde: '#34d399',
    glow: 'rgba(16, 185, 129, 0.45)',
    icono: '💡',
  },
  Consolidar: {
    tipo: 'consolidar',
    nombre: 'Consolidación',
    color: '#ec4899', // Rosa
    fondo: 'rgba(236, 72, 153, 0.18)',
    borde: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.45)',
    icono: '📝',
  },
  Registrar: {
    tipo: 'consolidar',
    nombre: 'Evaluación y Registro',
    color: '#f43f5e', // Coral intenso
    fondo: 'rgba(244, 63, 94, 0.18)',
    borde: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.45)',
    icono: '🎯',
  },
  Repaso: {
    tipo: 'repaso',
    nombre: 'Repaso Obligatorio',
    color: '#eab308', // Dorado
    fondo: 'rgba(234, 179, 8, 0.18)',
    borde: '#facc15',
    glow: 'rgba(234, 179, 8, 0.45)',
    icono: '🔁',
  },
};

export function colorPorPaso(paso: string): InfoTipoLeccion {
  return COLORES_TIPO_LECCION[paso] ?? COLORES_TIPO_LECCION.Exponer;
}

export type LeccionItem = {
  id: string;
  paso: string;
  titulo: string;
  minutos: number;
  placeholder?: boolean;
};

const SESIONES_PREPARACION: LeccionItem[] = [
  { id: 's1', paso: 'Orientar', titulo: 'Diagnóstico previo y contexto', minutos: 5, placeholder: true },
  { id: 's2', paso: 'Exponer', titulo: 'Fundamentos esenciales', minutos: 12, placeholder: true },
  { id: 's3', paso: 'Practicar', titulo: 'Laboratorio guiado', minutos: 25, placeholder: true },
  { id: 's4', paso: 'Explicar', titulo: 'Demostración y técnica Feynman', minutos: 15, placeholder: true },
  { id: 's5', paso: 'Consolidar', titulo: 'Registro de dominio', minutos: 10, placeholder: true },
];

export function leccionesDeTema(t: TemaCurso): LeccionItem[] {
  if (t.leccion?.sesiones && t.leccion.sesiones.length > 0) {
    return t.leccion.sesiones.map((s) => ({
      id: s.id,
      paso: s.paso,
      titulo: s.titulo,
      minutos: s.minutos,
      placeholder: false,
    }));
  }
  return SESIONES_PREPARACION;
}

export type EstadoLeccion = 'hecho' | 'actual' | 'bloqueado';

export function calcularEstadoLeccion(
  s: LeccionItem,
  t: TemaCurso,
  m: ModuloCurso,
  moduloActual: number,
  pasoActual: { tema: TemaCurso; sesion: { id: string } } | null,
  progresoTema: Progreso | undefined
): EstadoLeccion {
  if (m.n > moduloActual || s.placeholder) {
    return 'bloqueado';
  }

  if (m.n < moduloActual) {
    return progresoTema?.sesiones[s.id]?.terminada ? 'hecho' : 'bloqueado';
  }

  // Estamos en el módulo actual
  if (!pasoActual) {
    // Todo lo publicado en el curso está terminado
    return progresoTema?.sesiones[s.id]?.terminada ? 'hecho' : 'bloqueado';
  }

  if (t.id === pasoActual.tema.id && s.id === pasoActual.sesion.id) {
    return 'actual';
  }

  if (progresoTema?.sesiones[s.id]?.terminada) {
    return 'hecho';
  }

  return 'bloqueado';
}

export function moduloEstaBloqueado(m: ModuloCurso, moduloActual: number): boolean {
  return m.n > moduloActual;
}
