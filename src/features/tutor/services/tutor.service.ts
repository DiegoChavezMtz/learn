import 'server-only';
import { env } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { http } from '@/services/http';
import type { Evaluacion } from '@/types/progreso';
import type { PeticionTutor } from '@/types/tutor';
import { buildMensajes, buildMensajesCorta, parseEvaluacion } from '../utils/tutor.prompt';

type ChatResponse = { choices?: { message?: { content?: string } }[]; base_resp?: { status_code: number } };

export const LIMITES = { texto: 6000, textoCorta: 800, prompt: 600, puntos: 12, punto: 300, pista: 300 } as const;

export const tutorService = {
  disponible: () => !!env.MINIMAX_API_KEY,

  /** Solo se atiende a quien tiene sesión en Supabase: la llave de MiniMax cuesta dinero. */
  async sesionValida(token: string): Promise<boolean> {
    const sb = getSupabaseAdmin();
    if (!sb || !token) return false;
    const { data, error } = await sb.auth.getUser(token);
    return !error && !!data.user;
  },

  entradaValida(p: PeticionTutor): boolean {
    const corta = p.tipo === 'corta';
    const largo = p.texto.trim().length;
    return (corta ? largo >= 3 && p.texto.length <= LIMITES.textoCorta && (p.referencia ?? '').length <= LIMITES.texto : largo >= 15 && p.texto.length <= LIMITES.texto) &&
      p.prompt.length <= LIMITES.prompt && (corta || p.puntos.length > 0) && p.puntos.length <= LIMITES.puntos && p.puntos.every((x) => x.length <= LIMITES.punto) &&
      (p.pista ?? '').length <= LIMITES.pista;
  },

  async evaluar(p: PeticionTutor): Promise<Evaluacion | null> {
    const r = await http.post<ChatResponse>(
      '/chat/completions',
      { model: env.MINIMAX_MODEL, temperature: 0.2, max_tokens: 1200, messages: p.tipo === 'corta' ? buildMensajesCorta(p.prompt, p.referencia ?? '', p.puntos, p.texto.trim(), p.pista) : buildMensajes(p.prompt, p.puntos, p.texto.trim()) },
      { baseURL: env.MINIMAX_BASE_URL, headers: { Authorization: `Bearer ${env.MINIMAX_API_KEY}` }, cache: 'no-store' },
    );
    return parseEvaluacion(r.choices?.[0]?.message?.content ?? '');
  },
};
