"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/site/motion-primitives";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/database";

const FILTROS = [
  { valor: "todas", label: "Tudo" },
  { valor: "ambiente", label: "Ambiente" },
  { valor: "pratos", label: "Pratos" },
  { valor: "equipe", label: "Bastidores" },
] as const;

/**
 * Grade em mosaico com lightbox. As alturas alternam por posição para
 * quebrar a rigidez do grid — o mood pede irregularidade editorial.
 */
export function GalleryGrid({ imagens }: { imagens: GalleryImage[] }) {
  const [filtro, setFiltro] = useState<string>("todas");
  const [aberta, setAberta] = useState<GalleryImage | null>(null);

  const visiveis =
    filtro === "todas"
      ? imagens
      : imagens.filter((i) => i.categoria === filtro);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
      <div
        role="group"
        aria-label="Filtrar galeria"
        className="flex flex-wrap gap-2"
      >
        {FILTROS.map((f) => {
          const ativo = filtro === f.valor;
          const disponivel =
            f.valor === "todas" ||
            imagens.some((i) => i.categoria === f.valor);

          if (!disponivel) return null;

          return (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={ativo}
              className={cn(
                "focus-visible:ring-ring rounded-none border px-4 py-1.5 text-[12px] tracking-[0.08em] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                ativo
                  ? "bg-olive border-olive text-paper-light"
                  : "border-ink/25 text-ink/70 hover:border-olive hover:text-olive",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {visiveis.map((img, i) => (
          <StaggerItem key={img.id}>
            <button
              type="button"
              onClick={() => setAberta(img)}
              className="group focus-visible:ring-ring block w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
              aria-label={`Ampliar: ${img.titulo ?? "foto do restaurante"}`}
            >
              <div
                className={cn(
                  "bg-paper-deep relative w-full overflow-hidden",
                  // Ritmo irregular: a cada 5 imagens, uma mais alta.
                  i % 5 === 0 ? "aspect-[3/4]" : "aspect-square",
                )}
              >
                <Image
                  src={img.imagem_url}
                  alt={img.titulo ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#1c241d]/0 transition-colors duration-500 group-hover:bg-[#1c241d]/20"
                />
              </div>
              {img.titulo && (
                <p className="text-ink/60 mt-2 text-left text-[12.5px] italic">
                  {img.titulo}
                </p>
              )}
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      <Dialog open={aberta !== null} onOpenChange={() => setAberta(null)}>
        <DialogContent
          showCloseButton={false}
          className="border-paper/20 bg-[#1c241d] p-0 sm:max-w-[min(1100px,92vw)]"
        >
          <DialogTitle className="sr-only">
            {aberta?.titulo ?? "Foto do restaurante"}
          </DialogTitle>

          {aberta && (
            <figure className="relative">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={aberta.imagem_url}
                  alt={aberta.titulo ?? ""}
                  fill
                  sizes="92vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="text-paper/75 flex items-center justify-between gap-4 px-5 py-3.5 text-[13px]">
                <span className="italic">{aberta.titulo}</span>
                {aberta.credito && (
                  <span className="text-paper/45 text-[11.5px]">
                    Foto: {aberta.credito}
                  </span>
                )}
              </figcaption>
            </figure>
          )}

          <DialogClose
            aria-label="Fechar"
            className="text-paper/80 hover:bg-paper/15 hover:text-paper-light focus-visible:ring-paper absolute top-3 right-3 rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
