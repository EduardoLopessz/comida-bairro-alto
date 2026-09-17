import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHeader } from "@/components/site/page-header";
import { Eyebrow, TileOrnament } from "@/components/site/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import { getGallery, getSiteContent } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A história do Comida Bairro Alto: a herança italiana, polonesa, ucraniana e alemã de Curitiba servida em mesa de bairro, pela chef Helena Kowalski.",
};

/** As quatro heranças que sustentam o conceito da casa. */
const HERANCAS = [
  {
    pais: "Itália",
    texto:
      "Santa Felicidade, o galeto no fogo de chão e a massa aberta na mesa de domingo. A base da nossa seção de massas.",
  },
  {
    pais: "Polônia",
    texto:
      "O pierogi, o żurek fermentado por sete dias e a mão pesada na manteiga. A herança da família da chef.",
  },
  {
    pais: "Ucrânia",
    texto:
      "Beterraba, endro e creme azedo. O borsch que entra na carta em abril e só sai quando o frio vai embora.",
  },
  {
    pais: "Alemanha",
    texto:
      "Defumados, conservas, chucrute e cuca. A despensa que ensinou Curitiba a atravessar o inverno.",
  },
] as const;

export default async function SobrePage() {
  const [content, galeria] = await Promise.all([getSiteContent(), getGallery()]);

  const paragrafos = (content.sobre_texto ?? "").split("\n\n").filter(Boolean);
  const retrato =
    galeria.find((g) => g.categoria === "equipe") ?? galeria[0];
  const salao = galeria.find((g) => g.categoria === "ambiente");

  return (
    <>
      <PageHeader
        eyebrow="Sobre a casa"
        titulo={content.sobre_titulo ?? "Uma esquina do Bairro Alto"}
      />

      {/* --------------------------------------------------------- HISTÓRIA */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal>
            <div className="max-w-2xl space-y-6">
              {paragrafos.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "font-heading text-ink text-[clamp(1.25rem,2.2vw,1.6rem)] leading-[1.5]"
                      : "text-ink/78 text-[16.5px] leading-[1.8]"
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          {salao && (
            <Reveal delay={0.12}>
              <figure className="lg:sticky lg:top-28">
                <div className="bg-paper-deep relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={salao.imagem_url}
                    alt={salao.titulo ?? "Salão do restaurante"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-ink/55 mt-3 text-[12.5px] italic">
                  {salao.titulo}
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- HERANÇAS */}
      <section className="bg-olive text-paper py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow className="text-paper/70">Quatro mesas, uma só carta</Eyebrow>
            <h2 className="font-heading text-paper-light mt-5 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] tracking-[-0.015em]">
              O que cada colônia <em className="italic">deixou aqui</em>
            </h2>
          </Reveal>

          <Stagger className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {HERANCAS.map((h) => (
              <StaggerItem key={h.pais}>
                <article className="border-paper/20 border-t pt-6">
                  <h3 className="font-heading text-paper-light text-[24px] italic">
                    {h.pais}
                  </h3>
                  <p className="text-paper/75 mt-3 text-[14.5px] leading-relaxed">
                    {h.texto}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------------------------- CHEF */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {retrato && (
            <Reveal>
              <div className="bg-paper-deep relative aspect-square w-full overflow-hidden">
                <Image
                  src={retrato.imagem_url}
                  alt={`Retrato de ${content.sobre_chef_nome}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <TileOrnament className="text-olive/40" />
            <Eyebrow className="mt-7">Na cozinha</Eyebrow>
            <h2 className="font-heading mt-4 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] tracking-[-0.015em]">
              {content.sobre_chef_nome}
            </h2>
            <p className="text-ink/78 mt-6 max-w-xl text-[16.5px] leading-[1.8]">
              {content.sobre_chef_texto}
            </p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 sm:pb-32">
        <Reveal>
          <div className="border-ink/12 flex flex-col items-center border px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="font-heading max-w-xl text-[clamp(1.8rem,3.8vw,2.6rem)] leading-[1.08]">
              A melhor forma de entender é <em className="italic">sentando</em>
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-wine hover:bg-wine-light text-paper-light rounded-none px-9 py-6 text-[12.5px] tracking-[0.14em] uppercase"
              >
                <Link href="/reservas">Reservar mesa</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-olive/40 text-olive hover:bg-olive hover:text-paper-light rounded-none bg-transparent px-9 py-6 text-[12.5px] tracking-[0.14em] uppercase"
              >
                <Link href="/menu">Ver o cardápio</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
