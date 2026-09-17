# Comida Bairro Alto

Site oficial e painel administrativo do restaurante **Comida Bairro Alto** —
Bairro Alto, Curitiba/PR.

🌐 **Produção:** https://comida-bairro-alto.vercel.app
📋 **Decisões de projeto e pendências:** [DECISIONS.md](DECISIONS.md)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Animação | Motion (Framer Motion) |
| Backend | Supabase — Postgres, Auth e Storage |
| Deploy | Vercel (deploy automático a cada push na `main`) |

---

## Primeiros passos

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev
```

O site sobe em http://localhost:3000 mesmo sem banco configurado — as páginas
públicas caem para o conteúdo de `lib/content/seed-data.ts`.

### Configurar o banco

1. Aplique [`supabase/schema.sql`](supabase/schema.sql) no **SQL Editor** do
   projeto Supabase (tabelas, RLS, triggers e bucket de Storage).
2. Popule com o conteúdo base:

```bash
npm run db:seed
```

3. Crie um usuário com acesso ao painel:

```bash
npm run db:admin -- seu@email.com "SuaSenhaForte123" "Seu Nome"
```

Depois é só entrar em `/login`.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (roda checagem de tipos) |
| `npm run typecheck` | só a checagem de tipos |
| `npm run lint` | ESLint |
| `npm run db:seed` | popula cardápio, galeria, eventos e conteúdo |
| `npm run db:seed -- --force-content` | idem, sobrescrevendo textos já editados |
| `npm run db:admin -- <email> <senha> [nome]` | cria/promove um usuário da equipe |

---

## Estrutura

```
app/
├─ (site)/              site público
│  ├─ page.tsx          home
│  ├─ menu/             cardápio com filtros de dieta
│  ├─ sobre/            storytelling e chef
│  ├─ galeria/          mosaico com lightbox
│  ├─ novidades/        eventos
│  ├─ reservas/         formulário + Server Action
│  └─ contato/          mapa, horários e redes
├─ (admin)/
│  ├─ login/            autenticação
│  └─ admin/            painel protegido
│     ├─ page.tsx       dashboard com métricas
│     ├─ reservas/      gestão da agenda
│     ├─ cardapio/      CRUD de categorias e pratos
│     ├─ galeria/       CRUD de fotos
│     └─ conteudo/      textos institucionais
└─ api/menu-views/      contador de visualizações

components/
├─ ui/                  shadcn/ui
├─ site/                componentes do site público
└─ admin/               componentes do painel

lib/
├─ supabase/            clients (browser, server, admin) e sessão
├─ content/seed-data.ts conteúdo base — fonte única
├─ data.ts              leitura pública com fallback
├─ auth.ts              autorização do painel
├─ validation.ts        schemas Zod
└─ utils.ts             formatação de data, moeda e slug

proxy.ts                renova a sessão e protege /admin
supabase/schema.sql     schema completo com RLS
types/database.ts       tipos do banco
```

---

## Variáveis de ambiente

| Variável | Onde usar | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente e servidor | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente e servidor | chave pública (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** | chave secreta — escritas do painel |
| `NEXT_PUBLIC_SITE_URL` | servidor | URL canônica, usada no Open Graph |

---

## Conteúdo e fotos

As fotos atuais são placeholders do Unsplash e devem ser substituídas por
fotos reais — pelo próprio painel, com upload para o Supabase Storage. Os
dados de contato também são fictícios. A lista completa está na seção 1 do
[DECISIONS.md](DECISIONS.md).
