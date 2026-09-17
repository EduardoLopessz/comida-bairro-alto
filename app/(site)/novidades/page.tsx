import type { Metadata } from "next";
import Image from "next/image";

import { PageHeader } from "@/components/site/page-header";
import { Eyebrow } from "@/components/site/brand";
import { Reveal } from "@/components/site/motion-primitives";
import { getEvents } from "@/lib/data";
import { formatDateBR } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Novidades e eventos",
  description:
    "Jantares de inverno, oficinas de pierogi e as mudanças da carta do Comida Bairro Alto.",
};

export default async function NovidadesPage() {
  const eventos = await getEvents();

  return (
    <>
      <PageHeader
        eyebrow="Novidades"
        titulo="O que está"
        destaque="acontecendo"
        descricao="Jantares de uma noite só, oficinas na nossa cozinha e as mudanças que a estação traz para a carta."
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 sm:pb-32">
        {eventos.length === 0 ? (
          <p className="text-ink/60 font-heading py-20 text-center text-xl italic">
            Nada marcado por enquanto. Volte em breve.
          </p>
        ) : (
          <div className="space-y-20 sm:space-y-28">
            {eventos.map((evento, i) => (
              <Reveal key={evento.id} as="article">
                <div
                  className={`grid gap-8 md:grid-cols-2 md:gap-14 ${
                    // Alterna o lado da foto para dar ritmo à lista.
                    i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                  }`}
                >
                  {evento.imagem_url && (
                    <figure className="bg-paper-deep relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={evento.imagem_url}
                        alt={evento.titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </figure>
                  )}

                  <div className="flex flex-col justify-center">
                    {evento.data_evento && (
                      <Eyebrow className="text-wine">
                        {formatDateBR(evento.data_evento)}
                      </Eyebrow>
                    )}
                    <h2 className="font-heading mt-4 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.08] tracking-[-0.015em]">
                      {evento.titulo}
                    </h2>
                    {evento.resumo && (
                      <p className="text-ink/75 mt-5 text-[16.5px] leading-[1.7]">
                        {evento.resumo}
                      </p>
                    )}
                    {evento.conteudo && (
                      <div className="border-ink/12 mt-6 space-y-4 border-l pl-6">
                        {evento.conteudo
                          .split("\n\n")
                          .filter(Boolean)
                          .map((p, pi) => (
                            <p
                              key={pi}
                              className="text-ink/65 text-[15px] leading-[1.75]"
                            >
                              {p}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
