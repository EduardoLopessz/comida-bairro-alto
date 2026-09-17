import { GalleryManager } from "@/components/admin/gallery-manager";
import { PageHeading } from "@/components/admin/page-heading";
import { clienteAdmin } from "@/lib/auth";
import type { GalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Galeria" };

export default async function AdminGaleriaPage() {
  const supabase = await clienteAdmin();

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("ordem", { ascending: true });

  const imagens = (data ?? []) as GalleryImage[];

  return (
    <>
      <PageHeading
        titulo="Galeria"
        descricao="Fotos do salão, dos pratos e dos bastidores. A ordem define a sequência na página pública."
      />

      {error ? (
        <div className="border-destructive/30 bg-destructive/8 text-destructive border px-5 py-4 text-[14px]">
          Não foi possível carregar a galeria: {error.message}
        </div>
      ) : (
        <GalleryManager imagens={imagens} />
      )}
    </>
  );
}
