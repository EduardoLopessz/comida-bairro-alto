import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";

import { DishCard } from "@/components/site/dish-card";
import { Eyebrow, SectionRule, TileOrnament } from "@/components/site/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import { getGallery, getHighlights, getSiteContent } from "@/lib/data";
import { formatDateBR } from "@/lib/utils";
import { getEvents } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [content, destaques, galeria, eventos] = await Promise.all([
    getSiteContent(),
    getHighlights(3),
    getGallery(),
    getEvents(),
  ]);

  const proximoEvento = eventos[0];
  const ambiente = galeria.filter((g) => g.categoria === "ambiente").slice(0, 2);

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80"
          alt="Salão do Comida Bairro Alto ao entardecer, com mesas de madeira e luz baixa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradiente duplo: escurece a base para o texto e puxa a cena
            para o verde oliva da marca, em vez de um preto neutro. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#1c241d]/92 via-[#1c241d]/45 to-[#1c241d]/25"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8 sm:pb-28">
          <Reveal y={30}>
            <Eyebrow className="text-paper-light/80">
              {content.hero_sobretitulo}
            </Eyebrow>
          </Reveal>

          <Reveal delay={0.08} y={30}>
            <h1 className="text-paper-light mt-5 max-w-4xl text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[0.98] font-light tracking-[-0.02em]">
              {content.hero_titulo}
            </h1>
          </Reveal>

          <Reveal delay={0.16} y={24}>
            <p className="text-paper-light/85 mt-7 max-w-xl text-[16px] leading-relaxed sm:text-[17px]">
              {content.hero_subtitulo}
            </p>
          </Reveal>

          <Reveal delay={0.24} y={20}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-wine hover:bg-wine-light text-paper-light rounded-none px-8 py-6 text-[12.5px] tracking-[0.14em] uppercase transition-colors"
              >
                <Link href="/reservas">Reservar mesa</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-paper-light/50 text-paper-light hover:bg-paper-light hover:text-olive rounded-none border bg-transparent px-8 py-6 text-[12.5px] tracking-[0.14em] uppercase transition-colors"
              >
                <Link href="/menu">Ver o cardápio</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.32} y={16}>
            <div className="text-paper-light/70 mt-12 flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
              <span className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-3.5" />
                {content.contato_endereco}
              </span>
              <span className="flex items-center gap-2">
                <Clock aria-hidden="true" className="size-3.5" />
                {content.horario_almoco}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- MANIFESTO */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <Eyebrow>O que servimos</Eyebrow>
              <h2 className="font-heading mt-5 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.015em]">
                {content.home_manifesto_titulo?.split(" ").map((palavra, i, arr) =>
                  i === arr.length - 1 ? (
                    <em key={i} className="italic">
                      {palavra}
                    </em>
                  ) : (
                    <span key={i}>{palavra} </span>
                  ),
                )}
              </h2>
              <TileOrnament className="text-olive/40 mt-8" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="max-w-2xl">
              <p className="text-ink/80 text-[17px] leading-[1.75] sm:text-[18px]">
                {content.home_manifesto}
              </p>
              <Link
                href="/sobre"
                className="text-wine hover:text-wine-light group mt-8 inline-flex items-center gap-2 text-[13.5px] tracking-[0.06em] transition-colors"
              >
                Conheça a nossa história
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- DESTAQUES */}
      <section className="bg-paper-deep/45 relative py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <Reveal className="text-center">
            <Eyebrow>Da carta desta semana</Eyebrow>
            <h2 className="font-heading mx-auto mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] tracking-[-0.015em]">
              Três pratos que contam <em className="italic">a casa inteira</em>
            </h2>
          </Reveal>

          <Stagger className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {destaques.map((item, i) => (
              <StaggerItem key={item.id}>
                <DishCard item={item} priority={i === 0} />
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-16 flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-olive/40 text-olive hover:bg-olive hover:text-paper-light rounded-none bg-transparent px-10 py-6 text-[12.5px] tracking-[0.14em] uppercase transition-colors"
            >
              <Link href="/menu">Cardápio completo</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- AMBIENTE */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-5">
            {ambiente.map((img, i) => (
              <StaggerItem
                key={img.id}
                className={i === 1 ? "mt-10 sm:mt-14" : undefined}
              >
                <div className="bg-paper-deep relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={img.imagem_url}
                    alt={img.titulo ?? "Ambiente do restaurante"}
                    fill
                    sizes="(max-width: 1024px) 45vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.12}>
            <Eyebrow>A casa</Eyebrow>
            <h2 className="font-heading mt-5 text-[clamp(1.9rem,4vw,3rem)] leading-[1.08] tracking-[-0.015em]">
              Madeira, brasa e <em className="italic">janela grande</em>
            </h2>
            <p className="text-ink/75 mt-6 max-w-lg text-[16.5px] leading-[1.75]">
              Quarenta lugares, mesa comunitária de peroba no centro do salão e
              uma cozinha aberta onde dá para ver a massa sendo aberta. No
              inverno a lareira fica acesa a tarde inteira — e é por isso que
              quase ninguém pede a conta cedo.
            </p>
            <Link
              href="/galeria"
              className="text-wine hover:text-wine-light group mt-8 inline-flex items-center gap-2 text-[13.5px] tracking-[0.06em] transition-colors"
            >
              Ver a galeria
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- NOVIDADE */}
      {proximoEvento && (
        <section className="mx-auto w-full max-w-[1400px] px-5 pb-8 sm:px-8">
          <SectionRule className="text-ink mb-16" />
          <Reveal>
            <div className="border-ink/12 grid gap-10 border md:grid-cols-[1.1fr_1fr]">
              <div className="bg-paper-deep relative min-h-[280px] w-full overflow-hidden md:min-h-[360px]">
                {proximoEvento.imagem_url && (
                  <Image
                    src={proximoEvento.imagem_url}
                    alt={proximoEvento.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-12">
                <Eyebrow>
                  Novidades
                  {proximoEvento.data_evento &&
                    ` · ${formatDateBR(proximoEvento.data_evento)}`}
                </Eyebrow>
                <h2 className="font-heading mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.1]">
                  {proximoEvento.titulo}
                </h2>
                {proximoEvento.resumo && (
                  <p className="text-ink/70 mt-4 text-[15.5px] leading-relaxed">
                    {proximoEvento.resumo}
                  </p>
                )}
                <Link
                  href="/novidades"
                  className="text-wine hover:text-wine-light group mt-7 inline-flex items-center gap-2 self-start text-[13.5px] tracking-[0.06em] transition-colors"
                >
                  Todas as novidades
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* --------------------------------------------------------------- CTA */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="bg-olive text-paper-light flex flex-col items-center px-6 py-20 text-center sm:px-12 sm:py-28">
            <TileOrnament className="text-paper/40" />
            <h2 className="font-heading mt-8 max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.06] tracking-[-0.015em]">
              Sua mesa está <em className="italic">esperando</em>
            </h2>
            <p className="text-paper/80 mt-5 max-w-md text-[16px] leading-relaxed">
              {content.horario_almoco} · {content.horario_jantar}.{" "}
              {content.horario_fechado}.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-paper-light text-olive hover:bg-paper mt-10 rounded-none px-10 py-6 text-[12.5px] tracking-[0.14em] uppercase transition-colors"
            >
              <Link href="/reservas">Reservar agora</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
