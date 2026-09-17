-- =====================================================================
-- COMIDA BAIRRO ALTO — schema completo (tabelas, RLS, triggers, storage)
-- Idempotente: pode ser reaplicado com segurança.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Equipe com acesso ao painel
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  criado_em timestamptz not null default now()
);

comment on table public.admin_users is
  'Equipe com acesso ao painel. O registro em auth.users vem do Supabase Auth; esta tabela autoriza o acesso.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.admin_users au where au.id = auth.uid()
  );
$fn$;

-- ---------------------------------------------------------------------
-- Categorias do cardápio
-- ---------------------------------------------------------------------
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists menu_categories_ordem_idx on public.menu_categories (ordem);

-- ---------------------------------------------------------------------
-- Itens do cardápio
-- ---------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.menu_categories (id) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(10, 2) not null default 0 check (preco >= 0),
  imagem_url text,
  imagem_credito text,
  tags text[] not null default '{}',
  destaque boolean not null default false,
  disponivel boolean not null default true,
  ordem integer not null default 0,
  visualizacoes integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists menu_items_categoria_idx on public.menu_items (categoria_id);
create index if not exists menu_items_disponivel_idx on public.menu_items (disponivel);
create index if not exists menu_items_tags_idx on public.menu_items using gin (tags);

-- ---------------------------------------------------------------------
-- Reservas
-- ---------------------------------------------------------------------
do $blk$ begin
  create type public.reservation_status as enum ('pendente', 'confirmada', 'cancelada', 'concluida');
exception when duplicate_object then null; end $blk$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 2 and 120),
  email text not null,
  telefone text not null check (char_length(trim(telefone)) between 8 and 30),
  data date not null,
  hora time not null,
  pessoas integer not null check (pessoas between 1 and 20),
  status public.reservation_status not null default 'pendente',
  observacoes text check (char_length(observacoes) <= 600),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists reservations_data_idx on public.reservations (data desc, hora);
create index if not exists reservations_status_idx on public.reservations (status);

-- ---------------------------------------------------------------------
-- Conteúdo institucional editável (chave/valor)
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  chave text primary key,
  valor text not null default '',
  rotulo text,
  grupo text not null default 'geral',
  tipo text not null default 'texto' check (tipo in ('texto', 'texto_longo', 'url', 'email', 'telefone')),
  ordem integer not null default 0,
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Galeria
-- ---------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  imagem_url text not null,
  credito text,
  categoria text not null default 'ambiente' check (categoria in ('ambiente', 'pratos', 'equipe')),
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Novidades / eventos
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text,
  imagem_url text,
  data_evento date,
  publicado boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Trigger de atualizado_em
-- ---------------------------------------------------------------------
create or replace function public.touch_atualizado_em()
returns trigger
language plpgsql
as $fn$
begin
  new.atualizado_em = now();
  return new;
end;
$fn$;

do $blk$
declare t text;
begin
  foreach t in array array['menu_categories', 'menu_items', 'reservations', 'site_content', 'events']
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_atualizado_em()', t);
  end loop;
end $blk$;

-- ---------------------------------------------------------------------
-- Contador de visualizações de prato (métrica do dashboard)
-- ---------------------------------------------------------------------
create or replace function public.increment_menu_item_views(item_id uuid)
returns void
language sql
security definer
set search_path = public
as $fn$
  update public.menu_items set visualizacoes = visualizacoes + 1 where id = item_id;
$fn$;

grant execute on function public.increment_menu_item_views(uuid) to anon, authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Leitura pública: menu, categorias, conteúdo, galeria, eventos
-- Escrita: somente admin autenticado
-- Reservas: insert público, leitura/update apenas admin
-- =====================================================================

alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.reservations    enable row level security;
alter table public.site_content    enable row level security;
alter table public.gallery_images  enable row level security;
alter table public.events          enable row level security;
alter table public.admin_users     enable row level security;

do $blk$
declare t text;
begin
  foreach t in array array['menu_categories', 'menu_items', 'site_content', 'gallery_images', 'events']
  loop
    execute format('drop policy if exists "%1$s_select_public" on public.%1$s', t);
    execute format('drop policy if exists "%1$s_write_admin" on public.%1$s', t);

    execute format(
      'create policy "%1$s_select_public" on public.%1$s for select using (true)', t);

    execute format(
      'create policy "%1$s_write_admin" on public.%1$s for all to authenticated
       using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $blk$;

-- Reservas
drop policy if exists "reservations_insert_public" on public.reservations;
create policy "reservations_insert_public" on public.reservations
  for insert to anon, authenticated with check (true);

drop policy if exists "reservations_select_admin" on public.reservations;
create policy "reservations_select_admin" on public.reservations
  for select to authenticated using (public.is_admin());

drop policy if exists "reservations_update_admin" on public.reservations;
create policy "reservations_update_admin" on public.reservations
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reservations_delete_admin" on public.reservations;
create policy "reservations_delete_admin" on public.reservations
  for delete to authenticated using (public.is_admin());

-- admin_users: cada admin enxerga a própria linha
drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
  for select to authenticated using (id = auth.uid());

-- =====================================================================
-- STORAGE — bucket público para fotos do cardápio e da galeria
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('menu', 'menu', true)
on conflict (id) do update set public = true;

drop policy if exists "menu_bucket_read" on storage.objects;
create policy "menu_bucket_read" on storage.objects
  for select using (bucket_id = 'menu');

drop policy if exists "menu_bucket_write" on storage.objects;
create policy "menu_bucket_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'menu' and public.is_admin())
  with check (bucket_id = 'menu' and public.is_admin());
