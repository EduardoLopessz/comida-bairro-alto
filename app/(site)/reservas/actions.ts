"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { reservationSchema, isPastDate } from "@/lib/validation";
import { todayISO } from "@/lib/utils";

export type ReservationState = {
  status: "idle" | "sucesso" | "erro";
  mensagem?: string;
  /** Erros por campo, para exibir junto de cada input. */
  erros?: Record<string, string>;
};

/**
 * Cria uma reserva. Roda com a chave pública (anon) de propósito: a policy
 * `reservations_insert_public` permite o insert, mas ninguém consegue LER
 * as reservas sem ser admin. Assim o formulário funciona sem expor nada.
 */
export async function criarReserva(
  _anterior: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const bruto = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    data: formData.get("data"),
    hora: formData.get("hora"),
    pessoas: formData.get("pessoas"),
    observacoes: formData.get("observacoes") ?? "",
  };

  // Honeypot: campo invisível que só um bot preenche. Responde "sucesso"
  // para não dar pista ao robô, mas não grava nada.
  if (formData.get("website")) {
    return { status: "sucesso", mensagem: "Reserva recebida." };
  }

  const parsed = reservationSchema.safeParse(bruto);

  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !erros[campo]) erros[campo] = issue.message;
    }
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros,
    };
  }

  if (isPastDate(parsed.data.data, todayISO())) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: { data: "Escolha uma data de hoje em diante." },
    };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "erro",
      mensagem:
        "O sistema de reservas está temporariamente indisponível. Ligue para (41) 3333-4160.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("reservations").insert({
      nome: parsed.data.nome,
      email: parsed.data.email.toLowerCase(),
      telefone: parsed.data.telefone,
      data: parsed.data.data,
      hora: parsed.data.hora,
      pessoas: parsed.data.pessoas,
      observacoes: parsed.data.observacoes || null,
    });

    if (error) {
      console.error("[reservas] falha ao inserir:", error.message);
      return {
        status: "erro",
        mensagem:
          "Não conseguimos registrar sua reserva agora. Tente de novo em instantes ou ligue para (41) 3333-4160.",
      };
    }

    return {
      status: "sucesso",
      mensagem:
        "Recebemos seu pedido de reserva. Confirmamos por e-mail em até 24 horas.",
    };
  } catch (erro) {
    console.error("[reservas] erro inesperado:", erro);
    return {
      status: "erro",
      mensagem:
        "Não conseguimos registrar sua reserva agora. Tente de novo em instantes.",
    };
  }
}
