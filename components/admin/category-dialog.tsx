"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  salvarCategoria,
  type FormResultado,
} from "@/app/(admin)/admin/cardapio/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MenuCategory } from "@/types/database";

const ESTADO_INICIAL: FormResultado = { ok: false };

export function CategoryDialog({
  aberto,
  aoFechar,
  categoria,
  proximaOrdem,
}: {
  aberto: boolean;
  aoFechar: () => void;
  categoria: MenuCategory | null;
  proximaOrdem: number;
}) {
  const [estado, formAction] = useActionState(salvarCategoria, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.ok) {
      toast.success(estado.mensagem ?? "Categoria salva.");
      aoFechar();
    } else if (estado.mensagem && !estado.erros) {
      toast.error("Não foi possível salvar", { description: estado.mensagem });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="bg-paper-light sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px]">
            {categoria ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            As categorias organizam o cardápio e viram as âncoras de navegação
            da página de menu.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {categoria && <input type="hidden" name="id" value={categoria.id} />}

          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <div>
              <Label htmlFor="cat-nome" className="text-ink/80 text-[13px] font-medium">
                Nome <span className="text-wine">*</span>
              </Label>
              <Input
                id="cat-nome"
                name="nome"
                defaultValue={categoria?.nome ?? ""}
                required
                autoFocus
                aria-invalid={Boolean(estado.erros?.nome)}
                className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px]"
              />
              {estado.erros?.nome && (
                <p role="alert" className="text-destructive mt-1.5 text-[12.5px]">
                  {estado.erros.nome}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cat-ordem" className="text-ink/80 text-[13px] font-medium">
                Ordem
              </Label>
              <Input
                id="cat-ordem"
                name="ordem"
                type="number"
                min="0"
                defaultValue={categoria?.ordem ?? proximaOrdem}
                className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px] tabular-nums"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cat-desc" className="text-ink/80 text-[13px] font-medium">
              Descrição
            </Label>
            <Textarea
              id="cat-desc"
              name="descricao"
              rows={3}
              maxLength={400}
              defaultValue={categoria?.descricao ?? ""}
              placeholder="Uma linha que apresenta a seção no cardápio."
              className="border-ink/20 bg-paper focus-visible:border-olive mt-2 rounded-none text-[14.5px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={aoFechar}
              className="border-ink/20 rounded-none bg-transparent"
            >
              Cancelar
            </Button>
            <BotaoSalvar />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BotaoSalvar() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-olive hover:bg-olive-light text-paper-light rounded-none"
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Salvando…
        </>
      ) : (
        "Salvar categoria"
      )}
    </Button>
  );
}
