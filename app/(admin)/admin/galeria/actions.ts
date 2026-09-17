"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clienteAdmin } from "@/lib/auth";
import type { FormResultado } from "@/app/(admin)/admin/cardapio/actions";

const imagemSchema = z.object({
  titulo: z.string().trim().max(160).optional().or(z.literal("")),
  imagem_url: z.string().trim().url("Informe uma URL de imagem válida."),
  credito: z.string().trim().max(160).optional().or(z.literal("")),
  categoria: z.enum(["ambiente", "pratos", "equipe"]),
  ordem: z.coerce.number().int().min(0).max(999),
});

function revalidarGaleria() {
  revalidatePath("/", "layout");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
}

export async function salvarImagem(
  _anterior: FormResultado,
  formData: FormData,
): Promise<FormResultado> {
  const id = String(formData.get("id") ?? "");

  const parsed = imagemSchema.safeParse({
    titulo: formData.get("titulo") ?? "",
    imagem_url: formData.get("imagem_url") ?? "",
    credito: formData.get("credito") ?? "",
    categoria: formData.get("categoria") ?? "ambiente",
    ordem: formData.get("ordem") ?? 0,
  });

  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !erros[campo]) erros[campo] = issue.message;
    }
    return { ok: false, erros };
  }

  try {
    const supabase = await clienteAdmin();
    const payload = {
      titulo: parsed.data.titulo || null,
      imagem_url: parsed.data.imagem_url,
      credito: parsed.data.credito || null,
      categoria: parsed.data.categoria,
      ordem: parsed.data.ordem,
    };

    const { error } = id
      ? await supabase.from("gallery_images").update(payload).eq("id", id)
      : await supabase.from("gallery_images").insert(payload);

    if (error) return { ok: false, mensagem: error.message };

    revalidarGaleria();
    return { ok: true, mensagem: "Foto salva." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

export async function excluirImagem(id: string): Promise<FormResultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidarGaleria();
    return { ok: true, mensagem: "Foto removida da galeria." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}
