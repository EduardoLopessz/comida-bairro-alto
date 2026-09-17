"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  excluirImagem,
  salvarImagem,
} from "@/app/(admin)/admin/galeria/actions";
import type { FormResultado } from "@/app/(admin)/admin/cardapio/actions";
import { ImageUpload } from "@/components/admin/image-upload";
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
import { cn } from "@/lib/utils";
import type { GalleryCategory, GalleryImage } from "@/types/database";

const ESTADO_INICIAL: FormResultado = { ok: false };

const CATEGORIA_LABEL: Record<GalleryCategory, string> = {
  ambiente: "Ambiente",
  pratos: "Pratos",
  equipe: "Bastidores",
};

export function GalleryManager({ imagens }: { imagens: GalleryImage[] }) {
  const [dialog, setDialog] = useState<{ imagem: GalleryImage | null } | null>(
    null,
  );
  const [paraExcluir, setParaExcluir] = useState<GalleryImage | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function confirmarExclusao() {
    if (!paraExcluir) return;
    const alvo = paraExcluir;
    setParaExcluir(null);
    setOcupado(alvo.id);

    startTransition(async () => {
      const r = await excluirImagem(alvo.id);
      setOcupado(null);
      if (r.ok) toast.success(r.mensagem ?? "Foto removida.");
      else toast.error("Não foi possível remover", { description: r.mensagem });
    });
  }

  const proximaOrdem = Math.max(0, ...imagens.map((i) => i.ordem)) + 1;

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setDialog({ imagem: null })}
          className="bg-olive hover:bg-olive-light text-paper-light rounded-none"
        >
          <Plus aria-hidden="true" className="size-4" />
          Adicionar foto
        </Button>
      </div>

      {imagens.length === 0 ? (
        <div className="border-ink/12 bg-paper/50 border px-6 py-20 text-center">
          <p className="text-ink/60 text-[15px]">A galeria está vazia.</p>
          <p className="text-ink/45 mt-2 text-[13.5px]">
            Adicione fotos do salão, dos pratos e dos bastidores.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {imagens.map((img) => {
            const carregando = ocupado === img.id;

            return (
              <li
                key={img.id}
                className={cn(
                  "border-ink/12 bg-paper/50 group border transition-opacity",
                  carregando && "opacity-50",
                )}
              >
                <div className="bg-paper relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={img.imagem_url}
                    alt={img.titulo ?? ""}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover"
                    unoptimized={
                      !img.imagem_url.includes("unsplash.com") &&
                      !img.imagem_url.includes("supabase.co")
                    }
                  />
                  <Badge
                    variant="outline"
                    className="bg-paper-light/92 border-ink/15 text-ink/70 absolute top-2 left-2 rounded-none text-[10.5px] font-normal"
                  >
                    {CATEGORIA_LABEL[img.categoria]}
                  </Badge>
                </div>

                <div className="flex items-start gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-[13.5px]">
                      {img.titulo ?? (
                        <span className="text-ink/40 italic">Sem título</span>
                      )}
                    </p>
                    <p className="text-ink/45 mt-0.5 text-[11.5px]">
                      Ordem {img.ordem}
                      {img.credito && ` · ${img.credito}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-0.5">
                    {carregando ? (
                      <Loader2
                        aria-label="Processando"
                        className="text-olive m-2 size-4 animate-spin"
                      />
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar ${img.titulo ?? "foto"}`}
                          onClick={() => setDialog({ imagem: img })}
                          className="text-ink/50 hover:text-olive size-8"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Excluir ${img.titulo ?? "foto"}`}
                          onClick={() => setParaExcluir(img)}
                          className="text-ink/50 hover:text-destructive size-8"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GalleryDialog
        aberto={dialog !== null}
        aoFechar={() => setDialog(null)}
        imagem={dialog?.imagem ?? null}
        proximaOrdem={proximaOrdem}
      />

      <AlertDialog
        open={paraExcluir !== null}
        onOpenChange={(v) => !v && setParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover esta foto da galeria?</AlertDialogTitle>
            <AlertDialogDescription>
              A foto sai da galeria do site. O arquivo em si continua no
              storage — se precisar dele de volta, é só cadastrar a URL
              novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function GalleryDialog({
  aberto,
  aoFechar,
  imagem,
  proximaOrdem,
}: {
  aberto: boolean;
  aoFechar: () => void;
  imagem: GalleryImage | null;
  proximaOrdem: number;
}) {
  const [estado, formAction] = useActionState(salvarImagem, ESTADO_INICIAL);
  const [categoria, setCategoria] = useState<GalleryCategory>(
    imagem?.categoria ?? "ambiente",
  );

  useEffect(() => {
    if (aberto) setCategoria(imagem?.categoria ?? "ambiente");
  }, [aberto, imagem]);

  useEffect(() => {
    if (estado.ok) {
      toast.success(estado.mensagem ?? "Foto salva.");
      aoFechar();
    } else if (estado.mensagem && !estado.erros) {
      toast.error("Não foi possível salvar", { description: estado.mensagem });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="bg-paper-light sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px]">
            {imagem ? "Editar foto" : "Adicionar foto"}
          </DialogTitle>
          <DialogDescription>
            Envie um arquivo ou cole a URL de uma imagem já hospedada.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          {imagem && <input type="hidden" name="id" value={imagem.id} />}
          <input type="hidden" name="categoria" value={categoria} />

          <ImageUpload
            name="imagem_url"
            label="Imagem"
            valorInicial={imagem?.imagem_url}
            erro={estado.erros?.imagem_url}
          />

          <div>
            <Label htmlFor="img-titulo" className="text-ink/80 text-[13px] font-medium">
              Título / legenda
            </Label>
            <Input
              id="img-titulo"
              name="titulo"
              defaultValue={imagem?.titulo ?? ""}
              placeholder="Ex.: Salão principal ao entardecer"
              className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <div>
              <Label className="text-ink/80 text-[13px] font-medium">
                Categoria
              </Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v as GalleryCategory)}
              >
                <SelectTrigger className="border-ink/20 bg-paper mt-2 h-10 w-full rounded-none text-[14.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_LABEL).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="img-ordem" className="text-ink/80 text-[13px] font-medium">
                Ordem
              </Label>
              <Input
                id="img-ordem"
                name="ordem"
                type="number"
                min="0"
                defaultValue={imagem?.ordem ?? proximaOrdem}
                className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px] tabular-nums"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="img-credito" className="text-ink/80 text-[13px] font-medium">
              Crédito
            </Label>
            <Input
              id="img-credito"
              name="credito"
              defaultValue={imagem?.credito ?? ""}
              placeholder="Ex.: Unsplash, ou o nome do fotógrafo"
              className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-10 rounded-none text-[14.5px]"
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
        "Salvar foto"
      )}
    </Button>
  );
}
