#!/usr/bin/env node
/**
 * Popula o Supabase com o conteúdo base do restaurante.
 *
 *   npm run db:seed
 *
 * Idempotente: apaga e recria o cardápio, a galeria e os eventos, e faz
 * upsert do conteúdo institucional (preservando textos já editados pela
 * equipe, a menos que você passe --force-content).
 *
 * Pré-requisito: `supabase/schema.sql` já aplicado no projeto.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Carrega .env.local sem depender de dotenv (fora da stack definida).
function carregarEnv() {
  for (const arquivo of [".env.local", ".env"]) {
    try {
      const conteudo = readFileSync(resolve(raiz, arquivo), "utf8");
      for (const linha of conteudo.split("\n")) {
        const limpa = linha.trim();
        if (!limpa || limpa.startsWith("#")) continue;
        const i = limpa.indexOf("=");
        if (i === -1) continue;
        const chave = limpa.slice(0, i).trim();
        const valor = limpa.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[chave]) process.env[chave] = valor;
      }
    } catch {
      // arquivo ausente — tudo bem, pode vir do ambiente
    }
  }
}

carregarEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error(
    "\n✖ Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Preencha o .env.local antes de rodar o seed.\n",
  );
  process.exit(1);
}

const forcarConteudo = process.argv.includes("--force-content");

// Node 22.18+/24 removem os tipos de um .ts importado sem transpilador.
const dados = await import("../lib/content/seed-data.ts");

const {
  SEED_CATEGORIES,
  SEED_ITEMS,
  SEED_GALLERY,
  SEED_CONTENT,
  SEED_EVENTS,
} = dados;

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function falhar(etapa, error) {
  console.error(`\n✖ ${etapa}: ${error.message}`);
  if (error.code === "42P01" || error.message.includes("does not exist")) {
    console.error(
      "\n  A tabela não existe. Aplique supabase/schema.sql primeiro:\n" +
        "  Dashboard → SQL Editor → cole o arquivo → Run.\n",
    );
  }
  process.exit(1);
}

console.log(`\n▸ Semeando ${URL}\n`);

// ------------------------------------------------------------- CARDÁPIO
// Apaga na ordem inversa da dependência. O cascade cuidaria dos itens,
// mas ser explícito deixa o log mais claro.
{
  const { error: e1 } = await supabase
    .from("menu_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (e1) falhar("limpando menu_items", e1);

  const { error: e2 } = await supabase
    .from("menu_categories")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (e2) falhar("limpando menu_categories", e2);

  const { data: categorias, error: e3 } = await supabase
    .from("menu_categories")
    .insert(
      SEED_CATEGORIES.map((c) => ({
        nome: c.nome,
        slug: c.slug,
        descricao: c.descricao,
        ordem: c.ordem,
      })),
    )
    .select("id, slug");
  if (e3) falhar("inserindo categorias", e3);

  console.log(`  ✓ ${categorias.length} categorias`);

  const idPorSlug = Object.fromEntries(categorias.map((c) => [c.slug, c.id]));

  const { error: e4 } = await supabase.from("menu_items").insert(
    SEED_ITEMS.map((i) => ({
      categoria_id: idPorSlug[i.categoria],
      nome: i.nome,
      descricao: i.descricao,
      preco: i.preco,
      imagem_url: i.imagem_url,
      imagem_credito: i.imagem_credito,
      tags: i.tags,
      destaque: i.destaque ?? false,
      disponivel: true,
      ordem: i.ordem,
    })),
  );
  if (e4) falhar("inserindo pratos", e4);

  console.log(`  ✓ ${SEED_ITEMS.length} pratos`);
}

// -------------------------------------------------------------- GALERIA
{
  const { error: e1 } = await supabase
    .from("gallery_images")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (e1) falhar("limpando gallery_images", e1);

  const { error: e2 } = await supabase.from("gallery_images").insert(SEED_GALLERY);
  if (e2) falhar("inserindo galeria", e2);

  console.log(`  ✓ ${SEED_GALLERY.length} fotos na galeria`);
}

// -------------------------------------------------------------- EVENTOS
{
  const { error: e1 } = await supabase
    .from("events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (e1) falhar("limpando events", e1);

  const { error: e2 } = await supabase.from("events").insert(SEED_EVENTS);
  if (e2) falhar("inserindo eventos", e2);

  console.log(`  ✓ ${SEED_EVENTS.length} novidades`);
}

// ------------------------------------------------------------- CONTEÚDO
{
  const { data: existentes } = await supabase
    .from("site_content")
    .select("chave");
  const jaTem = new Set((existentes ?? []).map((c) => c.chave));

  // Sem --force-content, só insere chaves novas: não queremos sobrescrever
  // um texto que a equipe já ajustou pelo painel.
  const paraGravar = forcarConteudo
    ? SEED_CONTENT
    : SEED_CONTENT.filter((c) => !jaTem.has(c.chave));

  if (paraGravar.length > 0) {
    const { error } = await supabase
      .from("site_content")
      .upsert(paraGravar, { onConflict: "chave" });
    if (error) falhar("gravando site_content", error);
  }

  console.log(
    `  ✓ ${paraGravar.length} campos de conteúdo` +
      (forcarConteudo ? " (sobrescritos)" : ` (${jaTem.size} preservados)`),
  );
}

console.log("\n✔ Seed concluído.\n");
