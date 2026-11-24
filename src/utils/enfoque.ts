/**
 * "Modo enfoque": de una lista larga solo se muestra dónde estás.
 * hechos (se pliegan), actual (grande), proximos (los 2 siguientes) y resto (oculto hasta que se pida).
 */
export function enfocar<T>(items: T[], esHecho: (t: T) => boolean) {
  const iActual = items.findIndex((t) => !esHecho(t));
  if (iActual < 0) return { hechos: items, actual: undefined as T | undefined, proximos: [] as T[], resto: [] as T[] };
  return {
    hechos: items.slice(0, iActual),
    actual: items[iActual] as T | undefined,
    proximos: items.slice(iActual + 1, iActual + 3),
    resto: items.slice(iActual + 3),
  };
}
