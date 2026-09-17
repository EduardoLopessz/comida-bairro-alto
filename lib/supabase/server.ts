import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./config";

/**
 * Client do Supabase para Server Components, Route Handlers e Server Actions.
 * Propaga a sessão do usuário pelos cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado a partir de um Server Component: o middleware já cuida
          // de renovar a sessão, então é seguro ignorar.
        }
      },
    },
  });
}

/**
 * Client com a secret key — ignora RLS. Use SOMENTE no servidor e apenas
 * depois de checar que o usuário é admin. Nunca importar em Client Component.
 */
export function createAdminClient() {
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
