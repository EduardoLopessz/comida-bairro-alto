"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  salvarItem,
  type FormResultado,
} from "@/app/(admin)/admin/cardapio/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DIET_TAGS, DIET_TAG_LABEL } from "@/types/database";
import type { MenuCategory, MenuItem } from "@/types/database";

const ESTADO_INICIAL: FormResultado = { ok: false };

export function MenuItemDialog({
  aberto,
  aoFechar,
  item,
  categorias,
  categoriaPadrao,
}: {
  aberto: boolean;
  aoFechar: () => void;
  /**
   * `null` = criar novo. O componente é remontado pelo pai (via `key`)
   * sempre que o alvo muda, então o estado inicial já vem correto — não há
   * efeito de sincronização aqui.
   */
  item: MenuItem | null;
  categorias: MenuCategory[];
  categoriaPadrao?: string;
}) {
  const [estado, formAction] = useActionState(salvarItem, ESTADO_INICIAL);
  const [categoria, setCategoria] = useState(
    item?.categoria_id ?? categoriaPadrao ?? categorias[0]?.id ?? "",
  );

  useEffect(() => {
    if (estado.ok) {
      toast.success(estado.mensagem ?? "Prato salvo.");
      aoFechar();
    } else if (estado.mensagem && !estado.erros) {
      toast.error("Não foi possível salvar", { description: estado.mensagem });
    }
    // `aoFechar` é estável o bastante aqui; incluir causaria loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="bg-paper-light max-h-[92svh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px]">
            {item ? "Editar prato" : "Novo prato"}
          </DialogTitle>
          <DialogDescription>
            As alterações aparecem no cardápio do site assim que você salvar.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {item && <input type="hidden" name="id" value={item.id} />}
          <input type="hidden" name="categoria_id" value={categoria} />

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div>
              <Label htmlFor="item-nome" className="text-ink/80 text-[13px] font-medium">
                Nome <span className="text-wine">*</span>
              </Label>
              <Input
                id="item-nome"
                name="nome"
                defaultValue={item?.nome ?? ""}
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
              <Label htmlFor="item-preco" className="text-ink/80 text-[13px] font-medium">
                Preço (R$) <span className="text-wine">*</span>
              </Label>
              <Input
                id="item-preco"
                name="preco"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.preco ?? ""}
                required
                aria-invalid={Boolean(estado.erros?.preco)}
                className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px] tabular-nums"
              />
              {estado.erros?.preco && (
                <p role="alert" className="text-destructive mt-1.5 text-[12.5px]">
                  {estado.erros.preco}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <div>
              <Label className="text-ink/80 text-[13px] font-medium">
                Categoria <span className="text-wine">*</span>
              </Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="border-ink/20 bg-paper mt-2 h-10 w-full rounded-none text-[14.5px]">
                  <SelectValue placeholder="Escolha a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {estado.erros?.categoria_id && (
                <p role="alert" className="text-destructive mt-1.5 text-[12.5px]">
                  {estado.erros.categoria_id}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="item-ordem" className="text-ink/80 text-[13px] font-medium">
                Ordem
              </Label>
              <Input
                id="item-ordem"
                name="ordem"
                type="number"
                min="0"
                defaultValue={item?.ordem ?? 0}
                className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px] tabular-nums"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="item-desc" className="text-ink/80 text-[13px] font-medium">
              Descrição
            </Label>
            <Textarea
              id="item-desc"
              name="descricao"
              rows={3}
              maxLength={600}
              defaultValue={item?.descricao ?? ""}
              placeholder="Ingredientes principais, técnica, origem…"
              className="border-ink/20 bg-paper focus-visible:border-olive mt-2 rounded-none text-[14.5px]"
            />
          </div>

          <ImageUpload
            name="imagem_url"
            valorInicial={item?.imagem_url}
            erro={estado.erros?.imagem_url}
          />

          <div>
            <Label
              htmlFor="item-credito"
              className="text-ink/80 text-[13px] font-medium"
            >
              Crédito da foto
            </Label>
            <Input
              id="item-credito"
              name="imagem_credito"
              defaultValue={item?.imagem_credito ?? ""}
              placeholder="Ex.: Unsplash, ou o nome do fotógrafo"
              className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px]"
            />
          </div>

          <fieldset>
            <legend className="text-ink/80 text-[13px] font-medium">
              Restrições e características
            </legend>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
              {DIET_TAGS.map((tag) => (
                <div key={tag} className="flex items-center gap-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    name="tags"
                    value={tag}
                    defaultChecked={item?.tags?.includes(tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="text-ink/75 cursor-pointer text-[13.5px] font-normal"
                  >
                    {DIET_TAG_LABEL[tag]}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="border-ink/12 flex flex-wrap gap-x-8 gap-y-4 border-t pt-5">
            <div className="flex items-center gap-3">
              <Switch
                id="item-disponivel"
                name="disponivel"
                defaultChecked={item?.disponivel ?? true}
              />
              <Label
                htmlFor="item-disponivel"
                className="text-ink/75 cursor-pointer text-[13.5px] font-normal"
              >
                Disponível no cardápio
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="item-destaque"
                name="destaque"
                defaultChecked={item?.destaque ?? false}
              />
              <Label
                htmlFor="item-destaque"
                className="text-ink/75 cursor-pointer text-[13.5px] font-normal"
              >
                Destacar na home
              </Label>
            </div>
          </div>

          {estado.mensagem && !estado.ok && !estado.erros && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/8 text-destructive border px-3.5 py-2.5 text-[13px]"
            >
              {estado.mensagem}
            </p>
          )}

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
        "Salvar prato"
      )}
    </Button>
  );
}
