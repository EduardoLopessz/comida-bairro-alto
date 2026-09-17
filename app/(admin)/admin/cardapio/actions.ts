"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clienteAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type FormResultado = {
  ok: boolean;
  mensagem?: string;
  erros?: Record<string, string>;
  /** Id do registro criado, útil para o formulário reagir. */
  id?: string;
};

/** Revalida tudo que depende do cardápio — site e painel. */
function revalidarCardapio() {
  revalidatePath("/", "layout");
  revalidatePath("/menu");
  revalidatePath("/admin/cardapio");
  revalidatePath("/admin");
}

function coletarErros(erro: z.ZodError): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "");
    if (campo && !erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}

// ---------------------------------------------------------------- CATEGORIAS

const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da categoria.").max(80),
  descricao: z.string().trim().max(400).optional().or(z.literal("")),
  ordem: z.coerce.number().int().min(0).max(999),
});

export async function salvarCategoria(
  _anterior: FormResultado,
  formData: FormData,
): Promise<FormResultado> {
  const id = String(formData.get("id") ?? "");

  const parsed = categoriaSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao") ?? "",
    ordem: formData.get("ordem") ?? 0,
  });

  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error) };
  }

  try {
    const supabase = await clienteAdmin();
    const payload = {
      nome: parsed.data.nome,
      slug: slugify(parsed.data.nome),
      descricao: parsed.data.descricao || null,
      ordem: parsed.data.ordem,
    };

    const { data, error } = id
      ? await supabase
          .from("menu_categories")
          .update(payload)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase
          .from("menu_categories")
          .insert(payload)
          .select("id")
          .single();

    if (error) {
      // 23505 = unique_violation no slug
      if (error.code === "23505") {
        return {
          ok: false,
          erros: { nome: "Já existe uma categoria com esse nome." },
        };
      }
      return { ok: false, mensagem: error.message };
    }

    revalidarCardapio();
    return { ok: true, id: data?.id as string, mensagem: "Categoria salva." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

export async function excluirCategoria(id: string): Promise<FormResultado> {
  try {
    const supabase = await clienteAdmin();

    // O FK é ON DELETE CASCADE: avisamos quantos pratos vão junto.
    const { count } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", id);

    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidarCardapio();
    return {
      ok: true,
      mensagem: count
        ? `Categoria e ${count} ${count === 1 ? "prato" : "pratos"} removidos.`
        : "Categoria removida.",
    };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

// --------------------------------------------------------------------- ITENS

const itemSchema = z.object({
  categoria_id: z.string().uuid("Escolha uma categoria."),
  nome: z.string().trim().min(2, "Informe o nome do prato.").max(120),
  descricao: z.string().trim().max(600).optional().or(z.literal("")),
  preco: z.coerce
    .number()
    .min(0, "O preço não pode ser negativo.")
    .max(9999, "Preço fora do limite."),
  imagem_url: z
    .string()
    .trim()
    .url("Informe uma URL de imagem válida.")
    .optional()
    .or(z.literal("")),
  imagem_credito: z.string().trim().max(160).optional().or(z.literal("")),
  ordem: z.coerce.number().int().min(0).max(999),
});

export async function salvarItem(
  _anterior: FormResultado,
  formData: FormData,
): Promise<FormResultado> {
  const id = String(formData.get("id") ?? "");

  const parsed = itemSchema.safeParse({
    categoria_id: formData.get("categoria_id"),
    nome: formData.get("nome"),
    descricao: formData.get("descricao") ?? "",
    preco: formData.get("preco") ?? 0,
    imagem_url: formData.get("imagem_url") ?? "",
    imagem_credito: formData.get("imagem_credito") ?? "",
    ordem: formData.get("ordem") ?? 0,
  });

  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error) };
  }

  // Checkboxes: só chegam no FormData quando marcados.
  const tags = formData.getAll("tags").map(String).filter(Boolean);
  const disponivel = formData.get("disponivel") === "on";
  const destaque = formData.get("destaque") === "on";

  try {
    const supabase = await clienteAdmin();
    const payload = {
      categoria_id: parsed.data.categoria_id,
      nome: parsed.data.nome,
      descricao: parsed.data.descricao || null,
      preco: parsed.data.preco,
      imagem_url: parsed.data.imagem_url || null,
      imagem_credito: parsed.data.imagem_credito || null,
      tags,
      disponivel,
      destaque,
      ordem: parsed.data.ordem,
    };

    const { data, error } = id
      ? await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase.from("menu_items").insert(payload).select("id").single();

    if (error) return { ok: false, mensagem: error.message };

    revalidarCardapio();
    return { ok: true, id: data?.id as string, mensagem: "Prato salvo." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

export async function excluirItem(id: string): Promise<FormResultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidarCardapio();
    return { ok: true, mensagem: "Prato removido." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

/** Liga/desliga a disponibilidade sem abrir o formulário inteiro. */
export async function alternarDisponibilidade(
  id: string,
  disponivel: boolean,
): Promise<FormResultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase
      .from("menu_items")
      .update({ disponivel })
      .eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidarCardapio();
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

// ------------------------------------------------------------------- UPLOAD

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

/**
 * Envia uma foto para o bucket público `menu` e devolve a URL.
 * Valida tipo e tamanho no servidor — o `accept` do input é só conveniência.
 */
export async function enviarImagem(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; mensagem?: string }> {
  const arquivo = formData.get("arquivo");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, mensagem: "Nenhum arquivo selecionado." };
  }

  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return { ok: false, mensagem: "Use uma imagem JPG, PNG, WebP ou AVIF." };
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return { ok: false, mensagem: "A imagem precisa ter no máximo 5 MB." };
  }

  try {
    const supabase = await clienteAdmin();
    const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const caminho = `pratos/${crypto.randomUUID()}.${extensao}`;

    const { error } = await supabase.storage
      .from("menu")
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) return { ok: false, mensagem: error.message };

    const { data } = supabase.storage.from("menu").getPublicUrl(caminho);
    return { ok: true, url: data.publicUrl };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Falha no envio.",
    };
  }
}
