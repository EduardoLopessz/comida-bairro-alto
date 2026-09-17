# Decisões de projeto — Comida Bairro Alto

Registro das escolhas feitas de forma autônoma durante a construção, conforme
o modo de execução definido no briefing, e do que ficou pendente da sua
validação manual.

---

## 1. Pendências que precisam de você

### 1.1 Aplicar o schema no Supabase — **bloqueante para o painel**

O schema **ainda não foi aplicado**. Nem a *publishable key* nem a *secret key*
conseguem executar DDL: o PostgREST só expõe tabelas que já existem, e a
Management API exige um *personal access token* (`sbp_…`), que não foi
fornecido. Testei os dois caminhos (`api.supabase.com/v1/.../database/query`
devolveu 401; não há endpoint de SQL no projeto).

**Como aplicar (1 minuto):**

1. Abra o [SQL Editor do projeto](https://supabase.com/dashboard/project/nylvbqufmebfalzbedql/sql/new)
2. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**
3. No terminal, dentro da pasta do projeto:

```bash
npm run db:seed
```

4. Crie seu usuário do painel:

```bash
npm run db:admin -- seu@email.com "SuaSenhaForte123" "Seu Nome"
```

Enquanto o passo 1 não acontece, **o site público funciona normalmente** (ver
decisão 4.1) mas **o painel `/admin` não abre** e o formulário de reservas
não grava.

### 1.2 Fotos

Todas as fotos são **placeholders do Unsplash** (licença livre, uso comercial
permitido, sem atribuição obrigatória). Precisam ser trocadas por fotos reais
do restaurante. A origem de cada uma está registrada na seção 6.

A troca não exige programador: o painel tem upload direto para o Supabase
Storage em **Cardápio → editar prato → Enviar arquivo** e em **Galeria**.

### 1.3 Textos e dados de contato

Os textos são autorais e embasados na cultura gastronômica de Curitiba, mas
**os dados operacionais são fictícios** e precisam ser conferidos:

| Campo | Valor atual | Situação |
|---|---|---|
| Endereço | Rua Nossa Senhora da Luz, 1420 — Bairro Alto | rua real do bairro, número inventado |
| CEP | 82530-100 | aproximado da região |
| Telefone | (41) 3333-4160 | **fictício** |
| WhatsApp | 5541999998888 | **fictício** |
| E-mail | reservas@comidabairroalto.com.br | **domínio não registrado** |
| Instagram | @comidabairroalto | **não verificado** |
| Chef | Helena Kowalski | **personagem fictícia** |
| Horários | Ter–Dom almoço, Qua–Sáb jantar | inventados |
| Preços | R$ 16 a R$ 138 | coerentes com o posicionamento, mas arbitrários |

Tudo isso é editável em **Painel → Conteúdo**, sem tocar em código.

### 1.4 Confirmação de reserva por e-mail

O formulário grava a reserva e diz que "confirmamos por e-mail em até 24
horas" — mas **nenhum e-mail é disparado**. Hoje a confirmação é manual, pelo
painel. Enviar e-mail exigiria um provedor (Resend, SendGrid) que está fora
da stack definida no briefing; deixei o gancho pronto em
`app/(site)/reservas/actions.ts` para quando você decidir.

### 1.5 Domínio próprio

O site está em `comida-bairro-alto.vercel.app`. Para um domínio próprio,
aponte o DNS na Vercel e atualize a env `NEXT_PUBLIC_SITE_URL` (usada nas
meta tags de Open Graph).

---

## 2. Stack e infraestrutura

**2.1 — Next.js 16 com Turbopack.** Foi a versão estável no momento do
scaffold. React 19, App Router, Server Components por padrão; `"use client"`
só onde há interação real (filtros, formulários, diálogos do painel).

**2.2 — `proxy.ts` em vez de `middleware.ts`.** O briefing pedia
`middleware.ts`, mas o Next 16 deprecou essa convenção e emite aviso no build
(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
A função é idêntica; só o nome do arquivo e do export mudaram. Mantive o
comportamento pedido: renovação de sessão e bloqueio de `/admin`.

**2.3 — Tailwind v4 com tokens em CSS.** Sem `tailwind.config.js`: a v4
declara o tema em `@theme` dentro de `app/globals.css`. A paleta da marca
virou token utilitário (`bg-paper`, `text-olive`, `bg-wine`, `text-ink`) além
de alimentar as variáveis do shadcn — assim um `<Button>` padrão já sai
com a identidade correta.

**2.4 — Tipos do banco escritos à mão** (`types/database.ts`) em vez de
gerados pelo CLI do Supabase. Gerar exigiria o CLI instalado e um token de
acesso; como o schema é pequeno e estável, o custo de manter à mão é menor
que o de adicionar uma dependência de tooling. **Se você alterar o schema,
atualize esse arquivo junto.**

**2.5 — Deploy ligado ao GitHub.** Cada push na `main` dispara deploy de
produção automaticamente. As três variáveis de ambiente do Supabase estão
configuradas nos três ambientes (production, preview, development).

**2.6 — Projeto Vercel no time `gml4`.** O CLI vinculou ao time que já estava
ativo na sua conta, não à conta pessoal (a Vercel recusa a conta pessoal como
`--scope`). Se preferir movê-lo, é pelo dashboard.

---

## 3. Banco de dados

**3.1 — Duas tabelas além das pedidas.** O briefing listava quatro tabelas;
acrescentei `gallery_images` (a página de Galeria precisava ser gerenciável,
não hard-coded) e `events` (o briefing pedia para "avaliar se cabe" a seção
de novidades — cabe, e é barato).

**3.2 — `admin_users` como tabela de autorização.** O Supabase Auth diz
*quem* é a pessoa; a tabela `admin_users` diz se ela pode entrar no painel.
Sem isso, qualquer conta criada no Auth do projeto teria acesso. Uma função
`is_admin()` com `SECURITY DEFINER` centraliza a checagem nas policies.

**3.3 — RLS conforme o briefing, com uma adição.** Leitura pública em
`menu_items`, `menu_categories`, `site_content`, `gallery_images` e `events`;
escrita só para admin; `reservations` com insert público e leitura/update
restritos. A adição: o bucket de Storage `menu` é público para leitura e
restrito a admin para escrita.

**3.4 — Defesa em profundidade na autenticação.** O `proxy.ts` barra quem não
tem sessão, mas ele não é a única barreira: `exigirAdmin()` roda de novo em
todo carregamento de página do painel e em toda Server Action sensível. Um
proxy mal configurado no futuro não pode ser a única coisa entre um estranho
e o banco.

**3.5 — Escritas do painel usam a secret key.** Depois de `exigirAdmin()`
confirmar a identidade, as operações usam a chave que ignora RLS. Evita
depender de o JWT atravessar corretamente cada policy e torna os erros mais
previsíveis. A chave nunca sai do servidor.

**3.6 — Reservas gravam com a chave pública (anon).** De propósito: a policy
permite `insert` anônimo mas proíbe `select`. Ou seja, o formulário funciona
sem privilégio elevado e ninguém consegue ler as reservas alheias.

**3.7 — Status como `enum` do Postgres**, não texto livre — o banco recusa um
status inválido mesmo que algum código futuro erre.

---

## 4. Arquitetura da aplicação

**4.1 — Nenhuma função de leitura pública lança exceção.** Todas as funções
de `lib/data.ts` caem em `lib/content/seed-data.ts` quando o Supabase não
responde, não está configurado ou ainda não tem o schema. Isso é o que faz o
site estar no ar e completo agora, antes de o banco existir. Também significa
que uma instabilidade do Supabase degrada o site para conteúdo estático em
vez de derrubá-lo.

**4.2 — `seed-data.ts` como fonte única.** O mesmo arquivo alimenta o
fallback do site e o script `db:seed`. Evita o clássico "o seed SQL diz uma
coisa e o código diz outra".

**4.3 — Filtros do cardápio no cliente, filtros de reserva na URL.** O
cardápio inteiro já vem no Server Component (são dezenas de itens, não
milhares), então filtrar por dieta no browser é instantâneo e sem
round-trip. Já os filtros de reserva vivem em `searchParams`: a consulta é
feita no banco, o botão voltar funciona e o maître pode favoritar
"pendentes de hoje".

**4.4 — Validação com Zod nos dois lados.** O mesmo schema
(`lib/validation.ts`) roda no formulário e na Server Action. O cliente dá
feedback rápido; o servidor é quem decide.

**4.5 — Honeypot antispam no formulário de reservas.** Um campo invisível
que só robô preenche. Quando preenchido, a action responde "sucesso" e não
grava nada — não dá pista ao bot. Escolhido em vez de captcha por ser
gratuito, invisível e sem dependência externa.

**4.6 — Datas tratadas como string, nunca como `Date`.** `new Date("2026-07-18")`
é interpretada como UTC e, no horário de Brasília, volta um dia. Todas as
formatações passam por `formatDateBR()`, que monta a data com `Date.UTC` e
formata com `timeZone: "UTC"`. `todayISO()` usa o fuso de São Paulo.

**4.7 — Métrica de visualizações por sessão, não por render.** `ViewTracker`
dispara uma única vez por sessão de navegador (`sessionStorage`) e chama
`/api/menu-views`, que usa uma função `SECURITY DEFINER` para incrementar.
Contar por render faria um F5 inflar o número e a métrica não diria nada.

**4.8 — Painel com fundo claro, site com bege texturizado.** A textura de
papel é identidade e funciona no site; em ferramenta de uso diário, ela vira
ruído. O painel mantém a paleta (sidebar oliva, ações em vinho) sobre
superfície neutra de alto contraste.

**4.9 — Lista de reservas em cards, não em `<table>`.** Cada linha carrega
observações longas e três ações, e uma tabela real fica ilegível no celular
— que é onde o maître vai abrir isso, de pé no salão.

---

## 5. Design

**5.1 — Identidade seguida à risca:** bege papel `#EDE6DA`, oliva `#3A4B3C`,
vinho `#6B2737`, preto suave `#232323`; Fraunces nos títulos (com itálico nos
momentos de destaque) e Inter no corpo. Adicionei apenas três tons de apoio
derivados da paleta (`paper-deep`, `paper-light`, `olive-light`, `wine-light`)
para estados de hover e superfícies elevadas.

**5.2 — Textura de papel em SVG inline**, gerada por `feTurbulence` e
embutida como data-URI em `.paper-texture`. Zero requisições de rede, zero
arquivos de imagem para manter.

**5.3 — Ornamentos desenhados à mão em SVG** (`components/site/brand.tsx`):
um contorno de azulejo e um par de talheres, ambos herdando `currentColor`.
Cumprem a "ilustração linear leve" do briefing sem depender de biblioteca de
ícones decorativos.

**5.4 — Cantos retos em todo o site público** (`rounded-none` nos botões e
cards). O shadcn traz raio por padrão; o mood editorial pedia aresta viva.

**5.5 — Animações contidas.** Uma curva só (`cubic-bezier(0.22, 1, 0.36, 1)`),
deslocamentos de 8–24px, duração de 0,45–0,7s, `once: true` para não repetir
a cada rolagem. Tudo encapsulado em `components/site/motion-primitives.tsx`,
e todo o conjunto é desligado por `prefers-reduced-motion`.

**5.6 — Acessibilidade.** Skip-link no topo, `aria-current` na navegação,
`aria-pressed` nos filtros, `role="alert"` nas mensagens de erro,
`aria-live` na contagem de resultados, foco visível com `ring` em tudo que é
interativo, alt text descritivo ou vazio conforme a imagem seja informativa
ou decorativa, e contraste do texto sobre bege acima de 4.5:1.

---

## 6. Origem das imagens

Todas de **[Unsplash](https://unsplash.com)** — licença livre, uso comercial
permitido, atribuição não obrigatória. Todos os URLs foram verificados (HTTP
200) no momento da construção.

Os IDs estão em `lib/content/seed-data.ts`, no formato
`https://images.unsplash.com/photo-<id>`:

| Uso | ID da foto |
|---|---|
| Hero da home / salão | `1414235077428-338989a2e8c0` |
| Mesa comunitária | `1517248135467-4c7edcad34c4` |
| Balcão e adega | `1514933651103-005eec06c04b` |
| Café da tarde | `1559339352-11d035aa65de` |
| Salão visto da cozinha | `1555396273-367ea4eb4db5` |
| Pierogi de Pinhão | `1529042410759-befb1204b468` |
| Bolinho de Barreado / brasa | `1504674900247-0877df9cc836` |
| Tábua da Colônia / mesa posta | `1498837167922-ddd27525d352` |
| Cogumelos / feira | `1466637574441-749b8f19452f` |
| Borsch | `1547592180-85f173990554` |
| Caldo de pinhão | `1516684732162-798a0062be99` |
| Żurek | `1490645935967-10de6ba17061` |
| Capeletti / massa fresca | `1473093295043-cdd812d0e601` |
| Nhoque de pinhão | `1551183053-bf91a1d81141` |
| Tagliatelle | `1481931098730-318b6f776db0` |
| Polenta | `1512058564366-18510be2db19` |
| Barreado | `1544025162-d76694265947` |
| Costela de porco | `1600891964092-4316c288032e` |
| Galeto | `1432139555190-58524dae6a55` |
| Truta de Morretes | `1519708227418-c8fd9a32b7a2` |
| Raiz e Brasa / legumes | `1540189549336-e6e99c3679fe` |
| Sagu / sobremesa | `1551024601-bec78aea704b` |
| Cuca | `1567620905732-2d1ec7ab7445` |
| Makowiec | `1484723091739-30a097e8f929` |
| Sorvete de erva-mate | `1493770348161-369560ae357d` |
| Negroni de erva-mate | `1510812431401-41d2bd2722f3` |
| Vinho colonial | `1517244683847-7456b63c5969` |
| Quentão | `1470337458703-46ad1756a187` |
| Café coado | `1495474472287-4d71bcdd2085` |
| Pizza (não usada) | `1565299624946-b28f40a0ae38` |

**Mapa:** o embed do Google Maps usa o modo público `?output=embed`, que não
exige chave de API nem billing. Se um dia precisar de marcador customizado
ou Street View embutido, aí sim será preciso uma chave.

---

## 7. Pesquisa que embasou o cardápio

O cardápio é autoral, mas parte de pratos e ingredientes reais da tradição
curitibana e paranaense:

- **Imigração** — Curitiba recebeu italianos, poloneses, ucranianos e alemães
  entre 1870 e 1930. Santa Felicidade é o bairro de colonização italiana e
  até hoje o polo de cantinas da cidade; daí o galeto ao vinho e o capeletti
  in brodo, prato de domingo por lá.
- **Polônia e Ucrânia** — pierogi, żurek (sopa azeda de centeio fermentado),
  borsch de beterraba e makowiec (rocambole de papoula) são pratos da
  colônia, presentes em Araucária, Campo Largo e Prudentópolis.
- **Alemanha** — defumados, conservas, chucrute e cuca, a despensa de inverno
  que a região herdou.
- **Paraná** — pinhão (semente da araucária, safra de abril a julho, forte na
  região da Lapa), barreado (prato do litoral, de Morretes e Antonina,
  cozido por longas horas em panela de barro), truta da serra, queijo
  colonial de Witmarsum, erva-mate e vinho bordô colonial do interior.

Os nomes e descrições foram reescritos de forma autoral, como o briefing
autorizava — nada foi copiado de cardápio de restaurante existente.

---

## 8. O que foi deixado de fora, e por quê

- **Envio de e-mail de confirmação** — exigiria provedor fora da stack (4.1 da
  seção de pendências).
- **Controle de lotação por horário** — o formulário aceita qualquer horário
  dos turnos. Limitar por capacidade real exigiria modelar mesas e ocupação,
  o que vai além do escopo descrito.
- **Testes automatizados** — não estavam no escopo nem na stack obrigatória.
  O projeto tem `npm run typecheck` e o build roda checagem de tipos.
- **Tema escuro** — o bege papel é parte da identidade; um modo escuro
  contradiria a direção. Os tokens `.dark` existem só para manter os
  componentes shadcn válidos.
- **i18n** — o site é de um restaurante de bairro em Curitiba. Português só.
