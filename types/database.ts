/**
 * Tipos do banco escritos à mão (em vez de gerados pelo CLI do Supabase)
 * para manter o projeto sem dependência de tooling extra — ver DECISIONS.md.
 * Devem ser mantidos em sincronia com `supabase/schema.sql`.
 */

export type ReservationStatus =
  | "pendente"
  | "confirmada"
  | "cancelada"
  | "concluida";

export type GalleryCategory = "ambiente" | "pratos" | "equipe";

export type MenuCategory = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
};

export type MenuItem = {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  imagem_credito: string | null;
  tags: string[];
  destaque: boolean;
  disponivel: boolean;
  ordem: number;
  visualizacoes: number;
  criado_em: string;
  atualizado_em: string;
};

export type MenuItemWithCategory = MenuItem & {
  menu_categories: Pick<MenuCategory, "id" | "nome" | "slug"> | null;
};

export type MenuCategoryWithItems = MenuCategory & {
  menu_items: MenuItem[];
};

export type Reservation = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  hora: string;
  pessoas: number;
  status: ReservationStatus;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type SiteContent = {
  chave: string;
  valor: string;
  rotulo: string | null;
  grupo: string;
  tipo: "texto" | "texto_longo" | "url" | "email" | "telefone";
  ordem: number;
  atualizado_em: string;
};

export type GalleryImage = {
  id: string;
  titulo: string | null;
  imagem_url: string;
  credito: string | null;
  categoria: GalleryCategory;
  ordem: number;
  criado_em: string;
};

export type SiteEvent = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  data_evento: string | null;
  publicado: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type AdminUser = {
  id: string;
  email: string;
  nome: string | null;
  criado_em: string;
};

/** Tag de dieta usada nos filtros do cardápio público. */
export const DIET_TAGS = [
  "vegano",
  "vegetariano",
  "sem-gluten",
  "sem-lactose",
  "picante",
] as const;

export type DietTag = (typeof DIET_TAGS)[number];

export const DIET_TAG_LABEL: Record<string, string> = {
  vegano: "Vegano",
  vegetariano: "Vegetariano",
  "sem-gluten": "Sem glúten",
  "sem-lactose": "Sem lactose",
  picante: "Picante",
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  concluida: "Concluída",
};
