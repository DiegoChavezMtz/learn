'use client';
import { createContext, useContext } from 'react';

type Valor = { tema: string; libre: boolean };
const Ctx = createContext<Valor | null>(null);

/**
 * Indica en qué microtema está la pantalla (las tarjetas guardan su progreso en ese tema).
 * `libre` = práctica libre (sección Repasar): se puede practicar sin mover las cajas ni las fechas del repaso espaciado.
 */
export function TemaProvider({ tema, libre = false, children }: { tema: string; libre?: boolean; children: React.ReactNode }) {
  return <Ctx.Provider value={{ tema, libre }}>{children}</Ctx.Provider>;
}

function useValor(): Valor {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTema debe usarse dentro de TemaProvider');
  return v;
}

export const useTema = (): string => useValor().tema;
export const useModoLibre = (): boolean => useValor().libre;
