import { MenuManager } from "@/components/admin/menu-manager";
import { PageHeading } from "@/components/admin/page-heading";
import { clienteAdmin } from "@/lib/auth";
import type { MenuCategoryWithItems } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cardápio" };

export default async function AdminCardapioPage() {
  const supabase = await clienteAdmin();

  // Diferente do site público, aqui trazemos também os indisponíveis —
  // a equipe precisa enxergar o que está fora do ar para poder religar.
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*, menu_items(*)")
    .order("ordem", { ascending: true })
    .order("ordem", { referencedTable: "menu_items", ascending: true });

  const menu = (data ?? []) as MenuCategoryWithItems[];

  return (
    <>
      <PageHeading
        titulo="Cardápio"
        descricao="Categorias, pratos, preços e fotos. Tudo o que você salvar aqui aparece no site imediatamente."
      />

      {error ? (
        <div className="border-destructive/30 bg-destructive/8 text-destructive border px-5 py-4 text-[14px]">
          Não foi possível carregar o cardápio: {error.message}
        </div>
      ) : (
        <MenuManager menu={menu} />
      )}
    </>
  );
}
