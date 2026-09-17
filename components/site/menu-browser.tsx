"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { DishCard } from "@/components/site/dish-card";
import { Eyebrow } from "@/components/site/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DIET_TAGS,
  DIET_TAG_LABEL,
  type MenuCategoryWithItems,
} from "@/types/database";

/**
 * Navegação do cardápio: âncoras por categoria + filtros de dieta.
 *
 * Decisão: o filtro é client-side sobre o cardápio inteiro (já carregado
 * pelo Server Component). O cardápio de um restaurante tem dezenas de itens,
 * não milhares — filtrar no servidor custaria um round-trip por clique sem
 * ganho nenhum.
 */
export function MenuBrowser({ menu }: { menu: MenuCategoryWithItems[] }) {
  const [filtros, setFiltros] = useState<string[]>([]);

  // Só mostra os filtros de dieta que existem de fato na carta atual.
  const tagsDisponiveis = useMemo(() => {
    const presentes = new Set(
      menu.flatMap((c) => c.menu_items.flatMap((i) => i.tags ?? [])),
    );
    return DIET_TAGS.filter((t) => presentes.has(t));
  }, [menu]);

  const menuFiltrado = useMemo(() => {
    if (filtros.length === 0) return menu;
    return menu
      .map((categoria) => ({
        ...categoria,
        // Interseção: o prato precisa atender a TODOS os filtros marcados
        // (quem escolhe "vegano" + "sem glúten" quer os dois).
        menu_items: categoria.menu_items.filter((item) =>
          filtros.every((f) => item.tags?.includes(f)),
        ),
      }))
      .filter((categoria) => categoria.menu_items.length > 0);
  }, [menu, filtros]);

  const total = menuFiltrado.reduce((acc, c) => acc + c.menu_items.length, 0);

  function toggle(tag: string) {
    setFiltros((atual) =>
      atual.includes(tag) ? atual.filter((t) => t !== tag) : [...atual, tag],
    );
  }

  return (
    <div>
      {/* Barra de filtros e âncoras — gruda abaixo do header */}
      <div className="bg-paper/92 border-ink/10 sticky top-[68px] z-30 border-y backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <nav
            aria-label="Categorias do cardápio"
            className="scrollbar-none -mx-5 flex gap-6 overflow-x-auto px-5 py-3.5 sm:mx-0 sm:px-0"
          >
            {menuFiltrado.map((categoria) => (
              <a
                key={categoria.id}
                href={`#${categoria.slug}`}
                className="text-ink/65 hover:text-olive shrink-0 text-[12.5px] tracking-[0.1em] whitespace-nowrap uppercase transition-colors"
              >
                {categoria.nome}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        {/* Filtros de dieta */}
        <div
          role="group"
          aria-label="Filtrar cardápio por restrição alimentar"
          className="flex flex-wrap items-center gap-2 pt-10"
        >
          <span className="text-ink/50 mr-1 text-[11px] tracking-[0.2em] uppercase">
            Filtrar
          </span>

          {tagsDisponiveis.map((tag) => {
            const ativo = filtros.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                aria-pressed={ativo}
                className={cn(
                  "focus-visible:ring-ring rounded-none border px-3.5 py-1.5 text-[12px] tracking-[0.06em] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  ativo
                    ? "bg-olive border-olive text-paper-light"
                    : "border-ink/25 text-ink/70 hover:border-olive hover:text-olive",
                )}
              >
                {DIET_TAG_LABEL[tag]}
              </button>
            );
          })}

          {filtros.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFiltros([])}
              className="text-wine hover:text-wine-light h-auto gap-1.5 px-2 py-1.5 text-[12px]"
            >
              <X aria-hidden="true" className="size-3.5" />
              Limpar
            </Button>
          )}

          <span aria-live="polite" className="text-ink/50 ml-auto text-[12.5px]">
            {total} {total === 1 ? "prato" : "pratos"}
          </span>
        </div>

        {/* Categorias */}
        {menuFiltrado.length === 0 ? (
          <p className="text-ink/60 font-heading py-24 text-center text-xl italic">
            Nenhum prato atende a essa combinação de filtros.
          </p>
        ) : (
          menuFiltrado.map((categoria) => (
            <section
              key={categoria.id}
              id={categoria.slug}
              aria-labelledby={`titulo-${categoria.slug}`}
              className="scroll-mt-[150px] pt-20 first:pt-14"
            >
              <header className="max-w-2xl">
                <Eyebrow className="text-wine">
                  {String(categoria.ordem).padStart(2, "0")}
                </Eyebrow>
                <h2
                  id={`titulo-${categoria.slug}`}
                  className="font-heading mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] tracking-[-0.015em]"
                >
                  {categoria.nome}
                </h2>
                {categoria.descricao && (
                  <p className="text-ink/65 mt-3 text-[15.5px] leading-relaxed">
                    {categoria.descricao}
                  </p>
                )}
              </header>

              <div className="border-ink/10 mt-8 border-t">
                {categoria.menu_items.map((item) => (
                  <DishCard key={item.id} item={item} variant="carta" />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
