// Única puerta de entrada a las variables de entorno. Las llaves nunca se escriben en el código.
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  // Solo servidor:
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  EXPORT_TOKEN: process.env.EXPORT_TOKEN ?? '',
  MINIMAX_API_KEY: process.env.MINIMAX_API_KEY ?? '',
  MINIMAX_BASE_URL: process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1',
  MINIMAX_MODEL: process.env.MINIMAX_MODEL || 'MiniMax-M3',
} as const;
