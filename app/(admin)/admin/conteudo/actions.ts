"use server";

import { revalidatePath } from "next/cache";

import { clienteAdmin } from "@/lib/auth";

export type ConteudoResultado = { ok: boolean; mensagem?: string };

/**
 * Salva todos os campos de conteúdo de uma vez.
 *
 * Decisão: um único botão "Salvar" para a página inteira, em vez de um por
 * campo. A equipe costuma ajustar horário + telefone + aviso na mesma
 * sessão; salvar tudo junto é menos cliques e menos chance de esquecer algo.
 */
export async function salvarConteudo(
  _anterior: ConteudoResultado,
  formData: FormData,
): Promise<ConteudoResultado> {
  const atualizacoes: Array<{ chave: string; valor: string }> = [];

  for (const [campo, valor] of formData.entries()) {
    // Os inputs são nomeados como `conteudo:<chave>` para não colidir
    // com campos internos do form.
    if (!campo.startsWith("conteudo:")) continue;
    atualizacoes.push({
      chave: campo.slice("conteudo:".length),
      valor: String(valor),
    });
  }

  if (atualizacoes.length === 0) {
    return { ok: false, mensagem: "Nenhum campo para salvar." };
  }

  try {
    const supabase = await clienteAdmin();

    // Um update por chave. São ~20 linhas; um upsert em lote exigiria
    // reenviar rotulo/grupo/tipo e arriscaria sobrescrever metadados.
    const resultados = await Promise.all(
      atualizacoes.map(({ chave, valor }) =>
        supabase.from("site_content").update({ valor }).eq("chave", chave),
      ),
    );

    const falha = resultados.find((r) => r.error);
    if (falha?.error) {
      return { ok: false, mensagem: falha.error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/conteudo");

    return {
      ok: true,
      mensagem: `${atualizacoes.length} ${
        atualizacoes.length === 1 ? "campo atualizado" : "campos atualizados"
      }.`,
    };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}
