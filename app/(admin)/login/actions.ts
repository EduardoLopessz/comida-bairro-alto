"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = { erro?: string };

export async function entrar(
  _anterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const destino = String(formData.get("next") ?? "/admin");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  if (!isSupabaseConfigured) {
    return {
      erro: "Autenticação indisponível: o Supabase não está configurado.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data.user) {
    // Mensagem genérica de propósito: não confirma se o e-mail existe.
    return { erro: "E-mail ou senha incorretos." };
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return {
      erro: "Esta conta não tem acesso ao painel. Fale com o administrador.",
    };
  }

  revalidatePath("/", "layout");
  // Só aceita caminho interno — bloqueia open redirect via ?next=//evil.com
  redirect(destino.startsWith("/") && !destino.startsWith("//") ? destino : "/admin");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
