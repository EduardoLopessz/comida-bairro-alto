import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Clock, Mail, MapPin, Phone } from "lucide-react";

import { PageHeader } from "@/components/site/page-header";
import { Eyebrow, TileOrnament } from "@/components/site/brand";
import { Reveal } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Localização e contato",
  description:
    "Rua Nossa Senhora da Luz, 1420 — Bairro Alto, Curitiba. Telefone, WhatsApp, horários e como chegar ao Comida Bairro Alto.",
};

export default async function ContatoPage() {
  const content = await getSiteContent();
  const whatsapp = content.contato_whatsapp?.replace(/\D/g, "");
  const telefoneLimpo = content.contato_telefone?.replace(/\D/g, "");

  // Embed do Google Maps sem chave de API — o modo `q=` do /maps?output=embed
  // é público e não exige billing. Ver DECISIONS.md.
  const enderecoQuery = encodeURIComponent(
    `${content.contato_endereco}, ${content.contato_cep}`,
  );
  const mapaEmbed = `https://www.google.com/maps?q=${enderecoQuery}&output=embed&hl=pt-BR&z=16`;

  return (
    <>
      <PageHeader
        eyebrow="Localização e contato"
        titulo="Rua Nossa Senhora da Luz,"
        destaque="1420"
        descricao="Bairro Alto, zona nordeste de Curitiba. Estacionamento na rua e um ponto de ônibus a duas quadras."
        rule={false}
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* ------------------------------------------------------ INFOS */}
          <Reveal>
            <div className="space-y-10">
              <section>
                <Eyebrow className="text-wine">Onde estamos</Eyebrow>
                <address className="text-ink/80 mt-4 text-[17px] leading-[1.7] not-italic">
                  {content.contato_endereco}
                  <br />
                  CEP {content.contato_cep}
                </address>
                <Button
                  asChild
                  variant="outline"
                  className="border-olive/40 text-olive hover:bg-olive hover:text-paper-light mt-5 rounded-none bg-transparent px-6 text-[12px] tracking-[0.12em] uppercase"
                >
                  <a
                    href={content.contato_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin aria-hidden="true" className="size-4" />
                    Como chegar
                  </a>
                </Button>
              </section>

              <section className="border-ink/12 border-t pt-8">
                <Eyebrow className="text-wine">Horários</Eyebrow>
                <ul className="text-ink/80 mt-4 space-y-2 text-[15.5px]">
                  <li className="flex gap-3">
                    <Clock aria-hidden="true" className="text-olive mt-1 size-4 shrink-0" />
                    <span>{content.horario_almoco}</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock aria-hidden="true" className="text-olive mt-1 size-4 shrink-0" />
                    <span>{content.horario_jantar}</span>
                  </li>
                  <li className="text-ink/55 pl-7">{content.horario_fechado}</li>
                </ul>
              </section>

              <section className="border-ink/12 border-t pt-8">
                <Eyebrow className="text-wine">Fale com a gente</Eyebrow>
                <ul className="mt-4 space-y-3.5 text-[15.5px]">
                  <li className="flex gap-3">
                    <Phone aria-hidden="true" className="text-olive mt-1 size-4 shrink-0" />
                    <a
                      href={`tel:${telefoneLimpo}`}
                      className="text-ink/80 decoration-wine/40 hover:text-wine underline underline-offset-4 transition-colors"
                    >
                      {content.contato_telefone}
                    </a>
                  </li>
                  <li className="flex gap-3">
                    <Mail aria-hidden="true" className="text-olive mt-1 size-4 shrink-0" />
                    <a
                      href={`mailto:${content.contato_email}`}
                      className="text-ink/80 decoration-wine/40 hover:text-wine break-all underline underline-offset-4 transition-colors"
                    >
                      {content.contato_email}
                    </a>
                  </li>
                  {content.contato_instagram && (
                    <li className="flex gap-3">
                      <AtSign aria-hidden="true" className="text-olive mt-1 size-4 shrink-0" />
                      <a
                        href={content.contato_instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink/80 decoration-wine/40 hover:text-wine underline underline-offset-4 transition-colors"
                      >
                        @comidabairroalto
                      </a>
                    </li>
                  )}
                </ul>

                {whatsapp && (
                  <Button
                    asChild
                    className="bg-wine hover:bg-wine-light text-paper-light mt-6 rounded-none px-7 py-5 text-[12px] tracking-[0.12em] uppercase"
                  >
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chamar no WhatsApp
                    </a>
                  </Button>
                )}
              </section>

              <TileOrnament className="text-olive/30" />
            </div>
          </Reveal>

          {/* ------------------------------------------------------- MAPA */}
          <Reveal delay={0.12}>
            <div className="border-ink/12 bg-paper-deep relative h-[420px] w-full overflow-hidden border sm:h-[560px] lg:h-full lg:min-h-[560px]">
              <iframe
                src={mapaEmbed}
                title="Mapa com a localização do Comida Bairro Alto no Bairro Alto, Curitiba"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </Reveal>
        </div>

        {/* --------------------------------------------------------- CTA */}
        <Reveal delay={0.05}>
          <div className="bg-olive text-paper-light mt-20 flex flex-col items-center px-6 py-16 text-center sm:px-12">
            <h2 className="font-heading max-w-xl text-[clamp(1.7rem,3.5vw,2.5rem)] leading-[1.08]">
              Já sabe o dia? <em className="italic">Reserve.</em>
            </h2>
            <Button
              asChild
              size="lg"
              className="bg-paper-light text-olive hover:bg-paper mt-8 rounded-none px-9 py-6 text-[12.5px] tracking-[0.14em] uppercase"
            >
              <Link href="/reservas">Reservar mesa</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}
