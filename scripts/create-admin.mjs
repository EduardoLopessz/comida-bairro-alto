#!/usr/bin/env node
/**
 * Cria (ou promove) um usuário da equipe com acesso ao painel.
 *
 *   npm run db:admin -- email@exemplo.com "Senha Forte 123" "Nome da Pessoa"
 *
 * Faz duas coisas: cria o usuário no Supabase Auth com e-mail já confirmado
 * e registra a linha correspondente em `admin_users`, que é a tabela que
 * de fato autoriza o acesso (ver lib/auth.ts).
 *
 * Se o e-mail já existir no Auth, apenas promove a conta a admin.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const arquivo of [".env.local", ".env"]) {
  try {
    for (const linha of readFileSync(resolve(raiz, arquivo), "utf8").split("\n")) {
      const limpa = linha.trim();
      if (!limpa || limpa.startsWith("#")) continue;
      const i = limpa.indexOf("=");
      if (i === -1) continue;
      const chave = limpa.slice(0, i).trim();
      if (!process.env[chave]) {
        process.env[chave] = limpa.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // arquivo ausente
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [email, senha, nome] = process.argv.slice(2);

if (!URL || !KEY) {
  console.error("\n✖ Faltam as variáveis do Supabase no .env.local\n");
  process.exit(1);
}

if (!email || !senha) {
  console.error(
    '\n  Uso: npm run db:admin -- email@exemplo.com "SenhaForte123" "Nome"\n',
  );
  process.exit(1);
}

if (senha.length < 8) {
  console.error("\n✖ A senha precisa ter pelo menos 8 caracteres.\n");
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let userId;

const { data: criado, error: erroCriacao } =
  await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: nome ?? null },
  });

if (erroCriacao) {
  // Já existe: localiza o usuário e segue para a promoção.
  const jaExiste =
    erroCriacao.status === 422 ||
    /already been registered|already exists/i.test(erroCriacao.message);

  if (!jaExiste) {
    console.error(`\n✖ Falha ao criar o usuário: ${erroCriacao.message}\n`);
    process.exit(1);
  }

  const { data: lista, error: erroLista } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (erroLista) {
    console.error(`\n✖ ${erroLista.message}\n`);
    process.exit(1);
  }

  const existente = lista.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (!existente) {
    console.error("\n✖ Usuário já registrado, mas não encontrado na listagem.\n");
    process.exit(1);
  }

  userId = existente.id;
  console.log("  • Usuário já existia no Auth — promovendo a admin.");
} else {
  userId = criado.user.id;
  console.log("  ✓ Usuário criado no Supabase Auth.");
}

const { error: erroAdmin } = await supabase
  .from("admin_users")
  .upsert({ id: userId, email, nome: nome ?? null }, { onConflict: "id" });

if (erroAdmin) {
  console.error(`\n✖ Falha ao registrar em admin_users: ${erroAdmin.message}`);
  if (erroAdmin.code === "42P01") {
    console.error("  Aplique supabase/schema.sql antes de rodar este script.\n");
  }
  process.exit(1);
}

console.log(`  ✓ ${email} agora tem acesso ao painel.\n`);
console.log("    Entre em /login com esse e-mail e senha.\n");
