import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16 renomeou a convenção `middleware` para `proxy`
 * (ver node_modules/next/dist/docs/.../proxy.md). Mesma função:
 * roda antes de cada request, renova a sessão do Supabase e barra
 * quem não está autenticado nas rotas /admin.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Tudo, exceto assets estáticos e imagens — sem esta exclusão o
    // proxy bloquearia CSS, JS e fontes.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
