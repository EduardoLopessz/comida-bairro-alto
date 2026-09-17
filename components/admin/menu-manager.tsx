"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  alternarDisponibilidade,
  excluirCategoria,
  excluirItem,
} from "@/app/(admin)/admin/cardapio/actions";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { MenuItemDialog } from "@/components/admin/menu-item-dialog";
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
import { Switch } from "@/components/ui/switch";
import { cn, formatBRL } from "@/lib/utils";
import {
  DIET_TAG_LABEL,
  type MenuCategory,
  type MenuCategoryWithItems,
  type MenuItem,
} from "@/types/database";

/** Descarta a lista de pratos, devolvendo só os campos da categoria. */
function semItens(categoria: MenuCategoryWithItems): MenuCategory {
  const copia: Partial<MenuCategoryWithItems> = { ...categoria };
  delete copia.menu_items;
  return copia as MenuCategory;
}

type Exclusao =
  | { tipo: "item"; item: MenuItem }
  | { tipo: "categoria"; categoria: MenuCategoryWithItems };

/**
 * Gestão do cardápio: categorias como seções colapsáveis, pratos em linhas.
 *
 * Decisão: acordeão em vez de tabela plana. O cardápio tem hierarquia real
 * (categoria → prato) e a equipe quase sempre mexe numa seção por vez;
 * colapsar o resto reduz o ruído visual no uso diário.
 */
export function MenuManager({ menu }: { menu: MenuCategoryWithItems[] }) {
  // Só os metadados da categoria — os pratos ficam de fora, o seletor do
  // diálogo não precisa deles.
  const categorias: MenuCategory[] = menu.map((c) => semItens(c));

  const [abertas, setAbertas] = useState<string[]>(
    menu.slice(0, 2).map((c) => c.id),
  );
  const [dialogItem, setDialogItem] = useState<{
    item: MenuItem | null;
    categoriaId?: string;
  } | null>(null);
  const [dialogCategoria, setDialogCategoria] = useState<{
    categoria: MenuCategory | null;
  } | null>(null);
  const [exclusao, setExclusao] = useState<Exclusao | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function alternarSecao(id: string) {
    setAbertas((atual) =>
      atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id],
    );
  }

  function alternarDisponivel(item: MenuItem, valor: boolean) {
    setOcupado(item.id);
    startTransition(async () => {
      const r = await alternarDisponibilidade(item.id, valor);
      setOcupado(null);
      if (r.ok) {
        toast.success(
          valor
            ? `"${item.nome}" voltou ao cardápio.`
            : `"${item.nome}" saiu do cardápio.`,
        );
      } else {
        toast.error("Não foi possível atualizar", { description: r.mensagem });
      }
    });
  }

  function confirmarExclusao() {
    if (!exclusao) return;
    const alvo = exclusao;
    setExclusao(null);

    const id = alvo.tipo === "item" ? alvo.item.id : alvo.categoria.id;
    setOcupado(id);

    startTransition(async () => {
      const r =
        alvo.tipo === "item"
          ? await excluirItem(alvo.item.id)
          : await excluirCategoria(alvo.categoria.id);
      setOcupado(null);

      if (r.ok) toast.success(r.mensagem ?? "Removido.");
      else toast.error("Não foi possível remover", { description: r.mensagem });
    });
  }

  const proximaOrdem =
    Math.max(0, ...menu.map((c) => c.ordem)) + 1;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          onClick={() => setDialogItem({ item: null })}
          disabled={categorias.length === 0}
          className="bg-olive hover:bg-olive-light text-paper-light rounded-none"
        >
          <Plus aria-hidden="true" className="size-4" />
          Novo prato
        </Button>
        <Button
          variant="outline"
          onClick={() => setDialogCategoria({ categoria: null })}
          className="border-ink/20 text-ink/75 hover:border-olive hover:text-olive rounded-none bg-transparent"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nova categoria
        </Button>
      </div>

      {menu.length === 0 ? (
        <div className="border-ink/12 bg-paper/50 border px-6 py-20 text-center">
          <p className="text-ink/60 text-[15px]">
            O cardápio ainda está vazio.
          </p>
          <p className="text-ink/45 mt-2 text-[13.5px]">
            Comece criando uma categoria — por exemplo, “Entradas”.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {menu.map((categoria) => {
            const expandida = abertas.includes(categoria.id);
            const secaoOcupada = ocupado === categoria.id;

            return (
              <section
                key={categoria.id}
                className={cn(
                  "border-ink/12 bg-paper/50 border transition-opacity",
                  secaoOcupada && "opacity-50",
                )}
              >
                <header className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => alternarSecao(categoria.id)}
                    aria-expanded={expandida}
                    className="focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "text-ink/40 size-4 shrink-0 transition-transform duration-300",
                        !expandida && "-rotate-90",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="font-heading text-ink block truncate text-[19px]">
                        {categoria.nome}
                      </span>
                      <span className="text-ink/50 text-[12.5px]">
                        {categoria.menu_items.length}{" "}
                        {categoria.menu_items.length === 1 ? "prato" : "pratos"}
                        {" · ordem "}
                        {categoria.ordem}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDialogItem({ item: null, categoriaId: categoria.id })
                      }
                      className="text-ink/60 hover:text-olive h-8 text-[12.5px]"
                    >
                      <Plus aria-hidden="true" className="size-3.5" />
                      Prato
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar categoria ${categoria.nome}`}
                      onClick={() =>
                        setDialogCategoria({ categoria: semItens(categoria) })
                      }
                      className="text-ink/50 hover:text-olive size-8"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Excluir categoria ${categoria.nome}`}
                      onClick={() => setExclusao({ tipo: "categoria", categoria })}
                      className="text-ink/50 hover:text-destructive size-8"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </header>

                {expandida && (
                  <div className="border-ink/10 border-t">
                    {categoria.menu_items.length === 0 ? (
                      <p className="text-ink/45 px-5 py-10 text-center text-[13.5px]">
                        Nenhum prato nesta categoria ainda.
                      </p>
                    ) : (
                      <ul className="divide-ink/8 divide-y">
                        {categoria.menu_items.map((item) => {
                          const itemOcupado = ocupado === item.id;

                          return (
                            <li
                              key={item.id}
                              className={cn(
                                "flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-5",
                                itemOcupado && "opacity-50",
                                !item.disponivel && "bg-ink/[0.03]",
                              )}
                            >
                              <div className="border-ink/12 bg-paper relative size-[52px] shrink-0 overflow-hidden border">
                                {item.imagem_url ? (
                                  <Image
                                    src={item.imagem_url}
                                    alt=""
                                    fill
                                    sizes="52px"
                                    className="object-cover"
                                    unoptimized={
                                      !item.imagem_url.includes("unsplash.com") &&
                                      !item.imagem_url.includes("supabase.co")
                                    }
                                  />
                                ) : (
                                  <span className="text-ink/20 flex h-full items-center justify-center text-[10px]">
                                    sem foto
                                  </span>
                                )}
                              </div>

                              <div className="min-w-[160px] flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p
                                    className={cn(
                                      "text-[14.5px] font-medium",
                                      item.disponivel
                                        ? "text-ink"
                                        : "text-ink/45 line-through",
                                    )}
                                  >
                                    {item.nome}
                                  </p>
                                  {item.destaque && (
                                    <Star
                                      aria-label="Em destaque na home"
                                      className="fill-wine/20 text-wine size-3.5"
                                    />
                                  )}
                                </div>

                                {item.descricao && (
                                  <p className="text-ink/55 mt-0.5 line-clamp-1 text-[12.5px]">
                                    {item.descricao}
                                  </p>
                                )}

                                {item.tags?.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {item.tags.map((t) => (
                                      <Badge
                                        key={t}
                                        variant="outline"
                                        className="border-olive/25 text-olive/80 rounded-none px-1.5 py-0 text-[10px] font-normal"
                                      >
                                        {DIET_TAG_LABEL[t] ?? t}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <p className="font-heading text-olive w-[86px] shrink-0 text-right text-[15px] tabular-nums">
                                {formatBRL(item.preco)}
                              </p>

                              <div className="flex shrink-0 items-center gap-1.5">
                                {itemOcupado ? (
                                  <Loader2
                                    aria-label="Salvando"
                                    className="text-olive mx-2 size-4 animate-spin"
                                  />
                                ) : (
                                  <>
                                    <Switch
                                      checked={item.disponivel}
                                      onCheckedChange={(v) =>
                                        alternarDisponivel(item, v)
                                      }
                                      aria-label={`${item.nome} disponível no cardápio`}
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Editar ${item.nome}`}
                                      onClick={() => setDialogItem({ item })}
                                      className="text-ink/50 hover:text-olive size-8"
                                    >
                                      <Pencil className="size-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Excluir ${item.nome}`}
                                      onClick={() =>
                                        setExclusao({ tipo: "item", item })
                                      }
                                      className="text-ink/50 hover:text-destructive size-8"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------ MODAIS */}
      <MenuItemDialog
        // Remontar ao trocar de alvo zera o estado interno do formulário
        // sem precisar de um efeito de sincronização.
        key={`item-${dialogItem?.item?.id ?? dialogItem?.categoriaId ?? "novo"}`}
        aberto={dialogItem !== null}
        aoFechar={() => setDialogItem(null)}
        item={dialogItem?.item ?? null}
        categoriaPadrao={dialogItem?.categoriaId}
        categorias={categorias}
      />

      <CategoryDialog
        key={`cat-${dialogCategoria?.categoria?.id ?? "nova"}`}
        aberto={dialogCategoria !== null}
        aoFechar={() => setDialogCategoria(null)}
        categoria={dialogCategoria?.categoria ?? null}
        proximaOrdem={proximaOrdem}
      />

      <AlertDialog
        open={exclusao !== null}
        onOpenChange={(v) => !v && setExclusao(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {exclusao?.tipo === "categoria"
                ? "Excluir esta categoria?"
                : "Excluir este prato?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {exclusao?.tipo === "categoria" ? (
                <>
                  A categoria <strong>{exclusao.categoria.nome}</strong> e os{" "}
                  <strong>{exclusao.categoria.menu_items.length}</strong> pratos
                  dentro dela serão apagados definitivamente. Para apenas tirar
                  os pratos do ar, desligue a disponibilidade de cada um.
                </>
              ) : (
                <>
                  O prato <strong>{exclusao?.item.nome}</strong> será apagado
                  definitivamente. Se for algo sazonal, prefira desligar a
                  disponibilidade — assim ele volta com um clique.
                </>
              )}
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
