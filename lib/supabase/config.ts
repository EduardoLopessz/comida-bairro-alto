/**
 * Leitura centralizada das variáveis de ambiente do Supabase.
 *
 * O build da Vercel roda `next build` antes de qualquer request, e páginas
 * estáticas podem ser pré-renderizadas sem env configurada. Por isso as
 * funções de leitura pública degradam para dados de fallback em vez de
 * quebrar o build — ver `lib/fallback-content.ts`.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Há configuração suficiente para falar com o Supabase como visitante? */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Há configuração suficiente para operações administrativas no servidor? */
export const isSupabaseAdminConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
);
