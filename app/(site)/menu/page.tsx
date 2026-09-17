import type { Metadata } from "next";
import Link from "next/link";

import { MenuBrowser } from "@/components/site/menu-browser";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import { getMenu, getSiteContent } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Cardápio autoral do Comida Bairro Alto: pierogi de pinhão, barreado de dezoito horas, capeletti in brodo e massa fresca do dia. Filtros para vegano e sem glúten.",
};

export default async function MenuPage() {
  const [menu, content] = await Promise.all([getMenu(), getSiteContent()]);

  return (
    <>
      <PageHeader
        eyebrow="Cardápio"
        titulo="A carta muda com"
        destaque="a estação"
        descricao="Trabalhamos com o que o produtor tem para entregar. O pinhão vem da Lapa entre abril e julho, a truta desce de Morretes e a massa é aberta todo dia de manhã."
        rule={false}
      />

      <MenuBrowser menu={menu} />

      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="border-ink/12 flex flex-col items-center border px-6 py-16 text-center sm:px-12">
            <h2 className="font-heading text-[clamp(1.7rem,3.5vw,2.5rem)] leading-[1.1]">
              Alguma restrição que não está na lista?
            </h2>
            <p className="text-ink/70 mt-4 max-w-md text-[15.5px] leading-relaxed">
              Avise na reserva ou ligue para{" "}
              <a
                href={`tel:${content.contato_telefone?.replace(/\D/g, "")}`}
                className="decoration-wine/40 hover:text-wine underline underline-offset-4 transition-colors"
              >
                {content.contato_telefone}
              </a>
              . A cozinha adapta boa parte da carta.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-wine hover:bg-wine-light text-paper-light mt-9 rounded-none px-9 py-6 text-[12.5px] tracking-[0.14em] uppercase"
            >
              <Link href="/reservas">Reservar mesa</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
