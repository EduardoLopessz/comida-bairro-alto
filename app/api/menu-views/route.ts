import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Registra visualizações de pratos — a métrica "pratos mais vistos" do
 * painel.
 *
 * Contamos por sessão de navegador, não por render: o cliente só chama
 * este endpoint uma vez por sessão (ver components/site/view-tracker.tsx).
 * Sem isso, um F5 inflaria o número e a métrica não diria nada.
 *
 * Usa a função `increment_menu_item_views` (SECURITY DEFINER), então o
 * visitante anônimo consegue incrementar sem que a policy de escrita de
 * `menu_items` precise ser afrouxada.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: false }, { status: 204 });
  }

  let ids: unknown;
  try {
    ({ ids } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Teto de 60 para que um payload forjado não vire um ataque de escrita.
  const validos = ids
    .filter((id): id is string => typeof id === "string" && UUID.test(id))
    .slice(0, 60);

  if (validos.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    await Promise.all(
      validos.map((id) =>
        supabase.rpc("increment_menu_item_views", { item_id: id }),
      ),
    );
    return NextResponse.json({ ok: true, contados: validos.length });
  } catch {
    // Métrica não é crítica: falhar aqui nunca deve aparecer para o visitante.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
