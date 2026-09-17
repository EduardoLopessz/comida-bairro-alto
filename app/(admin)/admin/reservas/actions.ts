"use server";

import { revalidatePath } from "next/cache";

import { clienteAdmin } from "@/lib/auth";
import type { ReservationStatus } from "@/types/database";

const STATUS_VALIDOS: ReservationStatus[] = [
  "pendente",
  "confirmada",
  "cancelada",
  "concluida",
];

export type AcaoResultado = { ok: boolean; mensagem?: string };

export async function atualizarStatusReserva(
  id: string,
  status: ReservationStatus,
): Promise<AcaoResultado> {
  if (!STATUS_VALIDOS.includes(status)) {
    return { ok: false, mensagem: "Status inválido." };
  }

  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidatePath("/admin/reservas");
    revalidatePath("/admin");
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}

export async function excluirReserva(id: string): Promise<AcaoResultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) return { ok: false, mensagem: error.message };

    revalidatePath("/admin/reservas");
    revalidatePath("/admin");
    return { ok: true };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro inesperado.",
    };
  }
}
