// Almacenamiento local del navegador (etapa 2). En la etapa 3/4 se sincroniza con Supabase.
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin espacio o modo privado: la app sigue funcionando en memoria */
  }
}
