"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  salvarConteudo,
  type ConteudoResultado,
} from "@/app/(admin)/admin/conteudo/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/types/database";

const ESTADO_INICIAL: ConteudoResultado = { ok: false };

const TITULO_GRUPO: Record<string, { titulo: string; descricao: string }> = {
  home: {
    titulo: "Página inicial",
    descricao: "O hero e o texto de manifesto que abrem o site.",
  },
  sobre: {
    titulo: "Sobre",
    descricao:
      "História da casa e apresentação da chef. Separe parágrafos com uma linha em branco.",
  },
  contato: {
    titulo: "Contato",
    descricao: "Endereço, telefones e redes. Aparecem no rodapé e na página de contato.",
  },
  horarios: {
    titulo: "Horários",
    descricao: "Exibidos no rodapé, na home e na página de reservas.",
  },
  reservas: {
    titulo: "Reservas",
    descricao: "Avisos exibidos junto do formulário de reserva.",
  },
  geral: { titulo: "Geral", descricao: "Outros textos do site." },
};

const ORDEM_GRUPOS = ["home", "sobre", "horarios", "contato", "reservas", "geral"];

export function ContentEditor({ campos }: { campos: SiteContent[] }) {
  const [estado, formAction] = useActionState(salvarConteudo, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) toast.success(estado.mensagem ?? "Conteúdo salvo.");
    else if (estado.mensagem)
      toast.error("Não foi possível salvar", { description: estado.mensagem });
  }, [estado]);

  const grupos = ORDEM_GRUPOS.map((grupo) => ({
    grupo,
    campos: campos
      .filter((c) => c.grupo === grupo)
      .sort((a, b) => a.ordem - b.ordem),
  })).filter((g) => g.campos.length > 0);

  return (
    <form action={formAction}>
      <div className="space-y-8">
        {grupos.map(({ grupo, campos: doGrupo }) => {
          const meta = TITULO_GRUPO[grupo] ?? TITULO_GRUPO.geral;

          return (
            <section
              key={grupo}
              className="border-ink/12 bg-paper/50 border p-5 sm:p-6"
            >
              <header className="border-ink/10 mb-6 border-b pb-4">
                <h2 className="font-heading text-ink text-[20px]">
                  {meta.titulo}
                </h2>
                <p className="text-ink/55 mt-1 text-[13px]">{meta.descricao}</p>
              </header>

              <div className="grid gap-5 sm:grid-cols-2">
                {doGrupo.map((campo) => {
                  const id = `campo-${campo.chave}`;
                  const longo = campo.tipo === "texto_longo";

                  return (
                    <div
                      key={campo.chave}
                      className={longo ? "sm:col-span-2" : undefined}
                    >
                      <Label
                        htmlFor={id}
                        className="text-ink/80 text-[13px] font-medium"
                      >
                        {campo.rotulo ?? campo.chave}
                      </Label>

                      {longo ? (
                        <Textarea
                          id={id}
                          name={`conteudo:${campo.chave}`}
                          defaultValue={campo.valor}
                          rows={campo.chave === "sobre_texto" ? 12 : 4}
                          className="border-ink/20 bg-paper-light focus-visible:border-olive mt-2 rounded-none text-[14px] leading-relaxed"
                        />
                      ) : (
                        <Input
                          id={id}
                          name={`conteudo:${campo.chave}`}
                          type={
                            campo.tipo === "email"
                              ? "email"
                              : campo.tipo === "url"
                                ? "url"
                                : campo.tipo === "telefone"
                                  ? "tel"
                                  : "text"
                          }
                          defaultValue={campo.valor}
                          className="border-ink/20 bg-paper-light focus-visible:border-olive mt-2 h-10 rounded-none text-[14px]"
                        />
                      )}

                      <p className="text-ink/35 mt-1.5 font-mono text-[11px]">
                        {campo.chave}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Barra de salvar fixa — a página é longa e a equipe não deve
          precisar rolar até o fim para gravar. */}
      <div className="border-ink/12 bg-paper-light/95 sticky bottom-0 mt-8 flex items-center justify-between gap-4 border-t py-4 backdrop-blur-sm">
        <p className="text-ink/50 text-[12.5px]">
          As mudanças aparecem no site assim que você salvar.
        </p>
        <BotaoSalvar />
      </div>
    </form>
  );
}

function BotaoSalvar() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-olive hover:bg-olive-light text-paper-light shrink-0 rounded-none px-7"
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Salvando…
        </>
      ) : (
        <>
          <Save aria-hidden="true" className="size-4" />
          Salvar alterações
        </>
      )}
    </Button>
  );
}
