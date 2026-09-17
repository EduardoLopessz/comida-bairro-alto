"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { criarReserva, type ReservationState } from "@/app/(site)/reservas/actions";
import { TileOrnament } from "@/components/site/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, todayISO } from "@/lib/utils";
import { SERVICE_WINDOWS } from "@/lib/validation";

const ESTADO_INICIAL: ReservationState = { status: "idle" };

export function ReservationForm({ aviso }: { aviso?: string }) {
  const [estado, formAction] = useActionState(criarReserva, ESTADO_INICIAL);
  const [hora, setHora] = useState<string>("");
  const idBase = useId();
  const hoje = todayISO();

  useEffect(() => {
    // No sucesso o formulário é substituído pelo painel de confirmação —
    // ele desmonta sozinho, sem precisar de reset manual.
    if (estado.status === "sucesso") {
      toast.success("Pedido de reserva enviado", {
        description: estado.mensagem,
      });
    }
    if (estado.status === "erro" && !estado.erros) {
      toast.error("Não foi possível reservar", { description: estado.mensagem });
    }
  }, [estado]);

  if (estado.status === "sucesso") {
    return (
      <div
        role="status"
        className="border-olive/25 bg-paper-light flex flex-col items-center border px-6 py-16 text-center sm:px-12"
      >
        <span className="bg-olive text-paper-light flex size-14 items-center justify-center rounded-full">
          <Check aria-hidden="true" className="size-7" />
        </span>
        <h2 className="font-heading mt-7 text-[clamp(1.6rem,3.2vw,2.2rem)] leading-tight">
          Pedido <em className="italic">recebido</em>
        </h2>
        <p className="text-ink/70 mt-4 max-w-md text-[15.5px] leading-relaxed">
          {estado.mensagem}
        </p>
        <TileOrnament className="text-olive/30 mt-8" />
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="border-ink/12 bg-paper-light border p-6 sm:p-10"
    >
      {/* Honeypot — invisível para gente, irresistível para bot. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${idBase}-website`}>Não preencha este campo</label>
        <input
          id={`${idBase}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id={`${idBase}-nome`}
          name="nome"
          label="Nome completo"
          autoComplete="name"
          required
          erro={estado.erros?.nome}
          className="sm:col-span-2"
        />

        <Campo
          id={`${idBase}-email`}
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          required
          erro={estado.erros?.email}
        />

        <Campo
          id={`${idBase}-telefone`}
          name="telefone"
          type="tel"
          label="Telefone / WhatsApp"
          autoComplete="tel"
          placeholder="(41) 99999-9999"
          required
          erro={estado.erros?.telefone}
        />

        <Campo
          id={`${idBase}-data`}
          name="data"
          type="date"
          label="Data"
          min={hoje}
          required
          erro={estado.erros?.data}
          dica="Segundas-feiras a casa está fechada."
        />

        <Campo
          id={`${idBase}-pessoas`}
          name="pessoas"
          type="number"
          label="Número de pessoas"
          min={1}
          max={20}
          defaultValue={2}
          required
          erro={estado.erros?.pessoas}
        />
      </div>

      {/* Seletor de horário — botões em vez de <select> para deixar os
          dois turnos visíveis de uma vez. */}
      <fieldset className="mt-7">
        <legend className="text-ink/80 text-[13px] font-medium">
          Horário <span className="text-wine">*</span>
        </legend>
        <input type="hidden" name="hora" value={hora} />

        <div className="mt-4 space-y-4">
          {(
            [
              ["Almoço", SERVICE_WINDOWS.almoco],
              ["Jantar", SERVICE_WINDOWS.jantar],
            ] as const
          ).map(([turno, horarios]) => (
            <div key={turno}>
              <p className="text-ink/45 text-[11px] tracking-[0.18em] uppercase">
                {turno}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {horarios.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    aria-pressed={hora === h}
                    className={cn(
                      "focus-visible:ring-ring rounded-none border px-4 py-2 text-[13px] tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      hora === h
                        ? "bg-olive border-olive text-paper-light"
                        : "border-ink/20 text-ink/75 hover:border-olive hover:text-olive",
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {estado.erros?.hora && (
          <p role="alert" className="text-destructive mt-3 text-[12.5px]">
            {estado.erros.hora}
          </p>
        )}
      </fieldset>

      <div className="mt-7">
        <Label
          htmlFor={`${idBase}-obs`}
          className="text-ink/80 text-[13px] font-medium"
        >
          Observações
        </Label>
        <Textarea
          id={`${idBase}-obs`}
          name="observacoes"
          rows={4}
          maxLength={600}
          placeholder="Restrições alimentares, aniversário, cadeirinha para criança, preferência de mesa…"
          className="border-ink/20 bg-paper focus-visible:border-olive mt-2 rounded-none text-[15px]"
          aria-invalid={Boolean(estado.erros?.observacoes)}
        />
        {estado.erros?.observacoes && (
          <p role="alert" className="text-destructive mt-1.5 text-[12.5px]">
            {estado.erros.observacoes}
          </p>
        )}
      </div>

      {estado.status === "erro" && estado.mensagem && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mt-6 border px-4 py-3 text-[13.5px]"
        >
          {estado.mensagem}
        </p>
      )}

      {aviso && (
        <p className="text-ink/55 mt-6 text-[13px] leading-relaxed">{aviso}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="bg-wine hover:bg-wine-light text-paper-light mt-8 w-full rounded-none py-6 text-[12.5px] tracking-[0.14em] uppercase disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Enviando…
        </>
      ) : (
        "Solicitar reserva"
      )}
    </Button>
  );
}

/** Input rotulado com erro e dica — evita repetir a mesma estrutura 6 vezes. */
function Campo({
  id,
  name,
  label,
  erro,
  dica,
  className,
  required,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  erro?: string;
  dica?: string;
}) {
  const erroId = `${id}-erro`;
  const dicaId = `${id}-dica`;

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-ink/80 text-[13px] font-medium">
        {label} {required && <span className="text-wine">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(erro)}
        aria-describedby={
          [erro ? erroId : null, dica ? dicaId : null].filter(Boolean).join(" ") ||
          undefined
        }
        className={cn(
          "border-ink/20 bg-paper focus-visible:border-olive mt-2 h-11 rounded-none text-[15px]",
          erro && "border-destructive",
        )}
        {...props}
      />
      {dica && !erro && (
        <p id={dicaId} className="text-ink/45 mt-1.5 text-[12px]">
          {dica}
        </p>
      )}
      {erro && (
        <p id={erroId} role="alert" className="text-destructive mt-1.5 text-[12.5px]">
          {erro}
        </p>
      )}
    </div>
  );
}
