"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RESERVATION_STATUS_LABEL } from "@/types/database";

const PERIODOS = [
  { valor: "proximas", label: "Próximas" },
  { valor: "hoje", label: "Hoje" },
  { valor: "passadas", label: "Passadas" },
  { valor: "todas", label: "Todas" },
] as const;

/**
 * Filtros de reserva. O estado vive na URL (searchParams) em vez de no
 * componente: assim o maître pode favoritar "pendentes de hoje", o botão
 * voltar funciona e a filtragem acontece no banco, não no browser.
 */
export function ReservationFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pendente, startTransition] = useTransition();

  const periodo = params.get("periodo") ?? "proximas";
  const status = params.get("status") ?? "todos";
  const data = params.get("data") ?? "";

  function atualizar(chave: string, valor: string | null) {
    const novos = new URLSearchParams(params.toString());
    if (!valor || valor === "todos" || valor === "") novos.delete(chave);
    else novos.set(chave, valor);

    // Escolher uma data específica torna o filtro de período irrelevante.
    if (chave === "data" && valor) novos.delete("periodo");
    if (chave === "periodo") novos.delete("data");

    startTransition(() => {
      router.push(`/admin/reservas?${novos.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="border-ink/12 bg-paper/50 mb-6 flex flex-wrap items-end gap-x-6 gap-y-4 border p-4">
      <div>
        <p className="text-ink/50 mb-2 text-[11px] tracking-[0.16em] uppercase">
          Período
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS.map((p) => (
            <button
              key={p.valor}
              type="button"
              onClick={() => atualizar("periodo", p.valor)}
              aria-pressed={periodo === p.valor && !data}
              className={cn(
                "focus-visible:ring-ring rounded-none border px-3 py-1.5 text-[12.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
                periodo === p.valor && !data
                  ? "bg-olive border-olive text-paper-light"
                  : "border-ink/20 text-ink/70 hover:border-olive hover:text-olive",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-ink/50 mb-2 text-[11px] tracking-[0.16em] uppercase">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => atualizar("status", "todos")}
            aria-pressed={status === "todos"}
            className={cn(
              "focus-visible:ring-ring rounded-none border px-3 py-1.5 text-[12.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
              status === "todos"
                ? "bg-olive border-olive text-paper-light"
                : "border-ink/20 text-ink/70 hover:border-olive hover:text-olive",
            )}
          >
            Todos
          </button>

          {Object.entries(RESERVATION_STATUS_LABEL).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => atualizar("status", valor)}
              aria-pressed={status === valor}
              className={cn(
                "focus-visible:ring-ring rounded-none border px-3 py-1.5 text-[12.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
                status === valor
                  ? "bg-olive border-olive text-paper-light"
                  : "border-ink/20 text-ink/70 hover:border-olive hover:text-olive",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label
          htmlFor="filtro-data"
          className="text-ink/50 mb-2 block text-[11px] tracking-[0.16em] uppercase"
        >
          Data específica
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="filtro-data"
            type="date"
            value={data}
            onChange={(e) => atualizar("data", e.target.value)}
            className="border-ink/20 bg-paper-light focus-visible:border-olive h-9 w-[165px] rounded-none text-[13.5px]"
          />
          {data && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => atualizar("data", null)}
              className="text-wine hover:text-wine-light h-9 px-2 text-[12.5px]"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {pendente && (
        <Loader2
          aria-label="Carregando"
          className="text-olive mb-2 size-4 animate-spin"
        />
      )}
    </div>
  );
}
