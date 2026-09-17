import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  SEED_CATEGORIES,
  SEED_CONTENT,
  SEED_EVENTS,
  SEED_GALLERY,
  SEED_ITEMS,
} from "@/lib/content/seed-data";
import type {
  GalleryImage,
  MenuCategoryWithItems,
  MenuItem,
  SiteEvent,
} from "@/types/database";

/**
 * Camada de leitura do site público.
 *
 * Regra de ouro: NENHUMA destas funções lança. Se o Supabase não estiver
 * configurado, estiver fora do ar ou ainda sem o schema aplicado, elas caem
 * no conteúdo de `seed-data.ts`. Assim o site sobe na Vercel mesmo antes de
 * o banco estar populado, e uma falha de rede nunca derruba uma página.
 */

const FALLBACK_ID = (prefix: string, i: number) => `${prefix}-fallback-${i}`;

function fallbackMenu(): MenuCategoryWithItems[] {
  return SEED_CATEGORIES.map((categoria, ci) => ({
    id: FALLBACK_ID("cat", ci),
    nome: categoria.nome,
    slug: categoria.slug,
    descricao: categoria.descricao,
    ordem: categoria.ordem,
    criado_em: new Date(0).toISOString(),
    atualizado_em: new Date(0).toISOString(),
    menu_items: SEED_ITEMS.filter((i) => i.categoria === categoria.slug).map(
      (item, ii) => ({
        id: FALLBACK_ID(`item-${categoria.slug}`, ii),
        categoria_id: FALLBACK_ID("cat", ci),
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        imagem_url: item.imagem_url,
        imagem_credito: item.imagem_credito,
        tags: item.tags,
        destaque: item.destaque ?? false,
        disponivel: true,
        ordem: item.ordem,
        visualizacoes: 0,
        criado_em: new Date(0).toISOString(),
        atualizado_em: new Date(0).toISOString(),
      }),
    ),
  }));
}

/** Cardápio completo agrupado por categoria, só com itens disponíveis. */
export async function getMenu(): Promise<MenuCategoryWithItems[]> {
  if (!isSupabaseConfigured) return fallbackMenu();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*, menu_items(*)")
      .order("ordem", { ascending: true })
      .order("ordem", { referencedTable: "menu_items", ascending: true });

    if (error || !data?.length) return fallbackMenu();

    const categorias = (data as MenuCategoryWithItems[]).map((c) => ({
      ...c,
      menu_items: (c.menu_items ?? []).filter((i) => i.disponivel),
    }));

    return categorias.some((c) => c.menu_items.length > 0)
      ? categorias
      : fallbackMenu();
  } catch {
    return fallbackMenu();
  }
}

/** Pratos marcados como destaque, para a vitrine da home. */
export async function getHighlights(limit = 3): Promise<MenuItem[]> {
  const menu = await getMenu();
  const todos = menu.flatMap((c) => c.menu_items);
  const destaques = todos.filter((i) => i.destaque);
  return (destaques.length ? destaques : todos).slice(0, limit);
}

/** Conteúdo institucional como mapa chave → valor. */
export async function getSiteContent(): Promise<Record<string, string>> {
  const fallback = Object.fromEntries(
    SEED_CONTENT.map((c) => [c.chave, c.valor]),
  );

  if (!isSupabaseConfigured) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("chave, valor");

    if (error || !data?.length) return fallback;

    // O banco vence, mas chaves ausentes continuam vindo do seed — assim
    // uma chave nova no código não deixa a página com buraco.
    return {
      ...fallback,
      ...Object.fromEntries(
        data
          .filter((r) => r.valor?.trim())
          .map((r) => [r.chave as string, r.valor as string]),
      ),
    };
  } catch {
    return fallback;
  }
}

/** Imagens da galeria, opcionalmente filtradas por categoria. */
export async function getGallery(): Promise<GalleryImage[]> {
  const fallback: GalleryImage[] = SEED_GALLERY.map((g, i) => ({
    id: FALLBACK_ID("img", i),
    titulo: g.titulo,
    imagem_url: g.imagem_url,
    credito: g.credito,
    categoria: g.categoria,
    ordem: g.ordem,
    criado_em: new Date(0).toISOString(),
  }));

  if (!isSupabaseConfigured) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("ordem", { ascending: true });

    return error || !data?.length ? fallback : (data as GalleryImage[]);
  } catch {
    return fallback;
  }
}

/** Novidades e eventos publicados, mais recentes primeiro. */
export async function getEvents(): Promise<SiteEvent[]> {
  const fallback: SiteEvent[] = SEED_EVENTS.map((e, i) => ({
    id: FALLBACK_ID("evt", i),
    titulo: e.titulo,
    slug: e.slug,
    resumo: e.resumo,
    conteudo: e.conteudo,
    imagem_url: e.imagem_url,
    data_evento: e.data_evento,
    publicado: e.publicado,
    criado_em: new Date(0).toISOString(),
    atualizado_em: new Date(0).toISOString(),
  }));

  if (!isSupabaseConfigured) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("publicado", true)
      .order("data_evento", { ascending: false });

    return error || !data?.length ? fallback : (data as SiteEvent[]);
  } catch {
    return fallback;
  }
}
