"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  atualizarStatusReserva,
  excluirReserva,
} from "@/app/(admin)/admin/reservas/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateBR, formatTimeBR } from "@/lib/utils";
import {
  RESERVATION_STATUS_LABEL,
  type Reservation,
  type ReservationStatus,
} from "@/types/database";

const CORES_STATUS: Record<ReservationStatus, string> = {
  pendente: "bg-[#B08968]/15 text-[#7a5a3c] border-[#B08968]/35",
  confirmada: "bg-olive/12 text-olive border-olive/35",
  cancelada: "bg-destructive/10 text-destructive border-destructive/25",
  concluida: "bg-ink/8 text-ink/55 border-ink/20",
};

/**
 * Lista de reservas em cards (mobile) / linhas densas (desktop).
 *
 * Decisão: não usei `<Table>` do shadcn aqui. A linha precisa comportar
 * observações longas e três ações, e uma tabela real fica ilegível no
 * celular — que é onde o maître vai abrir isso, no salão.
 */
export function ReservationsTable({ reservas }: { reservas: Reservation[] }) {
  const [pendente, setPendente] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Reservation | null>(null);
  const [, startTransition] = useTransition();

  function mudarStatus(reserva: Reservation, status: ReservationStatus) {
    setPendente(reserva.id);
    startTransition(async () => {
      const r = await atualizarStatusReserva(reserva.id, status);
      setPendente(null);
      if (r.ok) {
        toast.success(
          `Reserva de ${reserva.nome} marcada como ${RESERVATION_STATUS_LABEL[status].toLowerCase()}.`,
        );
      } else {
        toast.error("Não foi possível atualizar", { description: r.mensagem });
      }
    });
  }

  function confirmarExclusao() {
    if (!paraExcluir) return;
    const reserva = paraExcluir;
    setParaExcluir(null);
    setPendente(reserva.id);

    startTransition(async () => {
      const r = await excluirReserva(reserva.id);
      setPendente(null);
      if (r.ok) toast.success(`Reserva de ${reserva.nome} excluída.`);
      else toast.error("Não foi possível excluir", { description: r.mensagem });
    });
  }

  if (reservas.length === 0) {
    return (
      <div className="border-ink/12 bg-paper/50 border px-6 py-20 text-center">
        <p className="text-ink/55 text-[14.5px]">
          Nenhuma reserva encontrada com esses filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="border-ink/12 divide-ink/8 bg-paper/50 divide-y border">
        {reservas.map((r) => {
          const ocupado = pendente === r.id;

          return (
            <li
              key={r.id}
              className={`px-4 py-4 transition-opacity sm:px-5 ${ocupado ? "opacity-50" : ""}`}
            >
              <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
                {/* Data e hora */}
                <div className="w-[76px] shrink-0">
                  <p className="font-heading text-ink text-[19px] leading-none tabular-nums">
                    {formatDateBR(r.data, { day: "2-digit", month: "2-digit" })}
                  </p>
                  <p className="text-ink/55 mt-1 text-[13px] tabular-nums">
                    {formatTimeBR(r.hora)}
                  </p>
                </div>

                {/* Identificação */}
                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink text-[15px] font-medium">{r.nome}</p>
                    <Badge
                      variant="outline"
                      className={`rounded-none text-[11px] font-normal ${CORES_STATUS[r.status]}`}
                    >
                      {RESERVATION_STATUS_LABEL[r.status]}
                    </Badge>
                  </div>

                  <p className="text-ink/60 mt-1 text-[13px]">
                    {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                    <a
                      href={`tel:${r.telefone.replace(/\D/g, "")}`}
                      className="text-ink/65 hover:text-olive inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone aria-hidden="true" className="size-3.5" />
                      {r.telefone}
                    </a>
                    <a
                      href={`mailto:${r.email}`}
                      className="text-ink/65 hover:text-olive inline-flex items-center gap-1.5 break-all transition-colors"
                    >
                      <Mail aria-hidden="true" className="size-3.5" />
                      {r.email}
                    </a>
                  </div>

                  {r.observacoes && (
                    <p className="border-wine/30 text-ink/70 mt-2.5 flex gap-2 border-l-2 pl-3 text-[13px] leading-relaxed">
                      <MessageSquare
                        aria-hidden="true"
                        className="text-wine/60 mt-0.5 size-3.5 shrink-0"
                      />
                      {r.observacoes}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {ocupado ? (
                    <Loader2
                      aria-label="Salvando"
                      className="text-olive size-4 animate-spin"
                    />
                  ) : (
                    <>
                      {r.status !== "confirmada" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => mudarStatus(r, "confirmada")}
                          className="border-olive/40 text-olive hover:bg-olive hover:text-paper-light h-8 rounded-none bg-transparent text-[12.5px]"
                        >
                          <Check aria-hidden="true" className="size-3.5" />
                          Confirmar
                        </Button>
                      )}

                      {r.status !== "cancelada" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => mudarStatus(r, "cancelada")}
                          className="border-ink/20 text-ink/65 hover:border-destructive hover:text-destructive h-8 rounded-none bg-transparent text-[12.5px]"
                        >
                          <X aria-hidden="true" className="size-3.5" />
                          Cancelar
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Mais ações para a reserva de ${r.nome}`}
                            className="text-ink/50 hover:text-ink size-8"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => mudarStatus(r, "concluida")}
                            disabled={r.status === "concluida"}
                          >
                            <Check aria-hidden="true" className="size-4" />
                            Marcar como concluída
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => mudarStatus(r, "pendente")}
                            disabled={r.status === "pendente"}
                          >
                            <Undo2 aria-hidden="true" className="size-4" />
                            Voltar para pendente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setParaExcluir(r)}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                            Excluir reserva
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <AlertDialog
        open={paraExcluir !== null}
        onOpenChange={(aberto) => !aberto && setParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              A reserva de <strong>{paraExcluir?.nome}</strong> para{" "}
              {paraExcluir && formatDateBR(paraExcluir.data)} às{" "}
              {paraExcluir && formatTimeBR(paraExcluir.hora)} será apagada
              definitivamente. Se a ideia é só recusar, prefira{" "}
              <strong>Cancelar</strong> — o histórico fica preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
