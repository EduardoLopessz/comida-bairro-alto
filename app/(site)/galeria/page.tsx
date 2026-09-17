import type { Metadata } from "next";

import { GalleryGrid } from "@/components/site/gallery-grid";
import { PageHeader } from "@/components/site/page-header";
import { getGallery } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "O salão, a cozinha aberta e os pratos do Comida Bairro Alto, no Bairro Alto, em Curitiba.",
};

export default async function GaleriaPage() {
  const imagens = await getGallery();

  return (
    <>
      <PageHeader
        eyebrow="Galeria"
        titulo="Quarenta lugares e"
        destaque="uma lareira"
        descricao="O salão, a cozinha aberta, a mesa comunitária de peroba e o que sai da brasa todos os dias."
        rule={false}
      />

      <div className="pb-24 sm:pb-32">
        <GalleryGrid imagens={imagens} />
      </div>
    </>
  );
}
