'use client';
import { createContext, useContext } from 'react';

const Ctx = createContext<string | null>(null);

/** Indica en qué microtema está la pantalla (las tarjetas guardan su progreso en ese tema). */
export function TemaProvider({ tema, children }: { tema: string; children: React.ReactNode }) {
  return <Ctx.Provider value={tema}>{children}</Ctx.Provider>;
}

export function useTema(): string {
  const t = useContext(Ctx);
  if (!t) throw new Error('useTema debe usarse dentro de TemaProvider');
  return t;
}
