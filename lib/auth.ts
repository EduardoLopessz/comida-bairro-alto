import "server-only";

import { redirect } from "next/navigation";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export type SessaoAdmin = {
  id: string;
  email: string;
  nome: string | null;
};

/**
 * Garante que quem está chamando é um admin autenticado.
 *
 * O proxy já barra visitante sem sessão em /admin, mas isso é só a primeira
 * camada: toda Server Action e todo carregamento de dados sensíveis chama
 * esta função de novo. Defesa em profundidade — um proxy mal-configurado
 * não pode ser o único obstáculo entre um estranho e o banco.
 *
 * Redireciona para /login em vez de lançar, para que o fluxo seja suave.
 */
export async function exigirAdmin(): Promise<SessaoAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, email, nome")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    // Autenticado no Supabase, mas fora da tabela de equipe. Encerra a
    // sessão para não deixar o usuário preso num limbo silencioso.
    await supabase.auth.signOut();
    redirect("/login?erro=sem-acesso");
  }

  return {
    id: admin.id as string,
    email: (admin.email as string) ?? user.email ?? "",
    nome: (admin.nome as string | null) ?? null,
  };
}

/**
 * Client com a secret key, liberado SOMENTE depois de `exigirAdmin()`.
 * Usado nas escritas do painel para não depender de o JWT do usuário
 * atravessar corretamente todas as policies.
 */
export async function clienteAdmin() {
  await exigirAdmin();

  if (!isSupabaseAdminConfigured) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada — o painel não consegue escrever no banco.",
    );
  }

  return createAdminClient();
}
