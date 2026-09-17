"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { enviarImagem } from "@/app/(admin)/admin/cardapio/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Campo de imagem com duas entradas: upload para o Supabase Storage ou
 * colar uma URL direta. A URL colada é o caminho usado hoje (fotos do
 * Unsplash); o upload é o caminho quando chegarem as fotos reais.
 */
export function ImageUpload({
  name,
  valorInicial,
  label = "Foto do prato",
  erro,
}: {
  name: string;
  valorInicial?: string | null;
  label?: string;
  erro?: string;
}) {
  const [url, setUrl] = useState(valorInicial ?? "");
  const [enviando, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function aoSelecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    startTransition(async () => {
      const resultado = await enviarImagem(formData);
      if (resultado.ok && resultado.url) {
        setUrl(resultado.url);
        toast.success("Foto enviada.");
      } else {
        toast.error("Falha no envio", { description: resultado.mensagem });
      }
      // Permite reenviar o mesmo arquivo depois de um erro.
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
      <Label htmlFor={`${name}-url`} className="text-ink/80 text-[13px] font-medium">
        {label}
      </Label>

      <div className="mt-2 flex gap-3">
        {/* Pré-visualização */}
        <div className="border-ink/15 bg-paper relative size-[84px] shrink-0 overflow-hidden border">
          {url ? (
            <>
              <Image
                src={url}
                alt=""
                fill
                sizes="84px"
                className="object-cover"
                // Uma URL colada pode ser de qualquer host; se o
                // next/image não conseguir otimizar, ainda assim aparece.
                unoptimized={!url.includes("unsplash.com") && !url.includes("supabase.co")}
              />
              <button
                type="button"
                onClick={() => setUrl("")}
                aria-label="Remover foto"
                className="bg-ink/70 hover:bg-ink absolute top-1 right-1 rounded-full p-1 text-white transition-colors"
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <div className="text-ink/25 flex h-full items-center justify-center">
              <ImageUp aria-hidden="true" className="size-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Input
            id={`${name}-url`}
            name={name}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… ou envie um arquivo"
            aria-invalid={Boolean(erro)}
            className="border-ink/20 bg-paper-light focus-visible:border-olive h-10 rounded-none text-[13.5px]"
          />

          <div className="mt-2 flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={aoSelecionar}
              className="sr-only"
              id={`${name}-arquivo`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={enviando}
              onClick={() => inputRef.current?.click()}
              className="border-ink/20 text-ink/70 hover:border-olive hover:text-olive h-8 rounded-none bg-transparent text-[12.5px]"
            >
              {enviando ? (
                <>
                  <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <ImageUp aria-hidden="true" className="size-3.5" />
                  Enviar arquivo
                </>
              )}
            </Button>
            <span className="text-ink/40 text-[11.5px]">
              JPG, PNG ou WebP · até 5 MB
            </span>
          </div>
        </div>
      </div>

      {erro && (
        <p role="alert" className="text-destructive mt-1.5 text-[12.5px]">
          {erro}
        </p>
      )}
    </div>
  );
}
