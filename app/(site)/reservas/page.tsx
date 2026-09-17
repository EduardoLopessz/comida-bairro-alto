import type { Metadata } from "next";
import { Clock, MapPin, Phone, Users } from "lucide-react";

import { PageHeader } from "@/components/site/page-header";
import { ReservationForm } from "@/components/site/reservation-form";
import { Reveal } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reservas",
  description:
    "Reserve sua mesa no Comida Bairro Alto. Almoço de terça a domingo, jantar de quarta a sábado, no Bairro Alto, em Curitiba.",
};

export default async function ReservasPage() {
  const content = await getSiteContent();
  const whatsapp = content.contato_whatsapp?.replace(/\D/g, "");

  return (
    <>
      <PageHeader
        eyebrow="Reservas"
        titulo="Guarde sua"
        destaque="mesa"
        descricao="Confirmamos todos os pedidos por e-mail em até 24 horas. Para grupos acima de oito pessoas, fale com a gente pelo WhatsApp."
        rule={false}
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <Reveal>
            <ReservationForm aviso={content.reservas_aviso} />
          </Reveal>

          <Reveal delay={0.12}>
            <aside className="lg:sticky lg:top-28">
              <h2 className="font-heading text-[24px] leading-tight">
                Antes de reservar
              </h2>

              <dl className="mt-7 space-y-6">
                <InfoRow icon={Clock} termo="Horários">
                  {content.horario_almoco}
                  <br />
                  {content.horario_jantar}
                  <br />
                  <span className="opacity-60">{content.horario_fechado}</span>
                </InfoRow>

                <InfoRow icon={Users} termo="Grupos">
                  Até 20 pessoas pelo site. Acima disso, ou para eventos
                  fechados, fale com a gente.
                </InfoRow>

                <InfoRow icon={MapPin} termo="Endereço">
                  {content.contato_endereco}
                  <br />
                  CEP {content.contato_cep}
                </InfoRow>

                <InfoRow icon={Phone} termo="Prefere falar?">
                  <a
                    href={`tel:${content.contato_telefone?.replace(/\D/g, "")}`}
                    className="decoration-wine/40 hover:text-wine underline underline-offset-4 transition-colors"
                  >
                    {content.contato_telefone}
                  </a>
                  {whatsapp && (
                    <>
                      <br />
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="decoration-wine/40 hover:text-wine underline underline-offset-4 transition-colors"
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                </InfoRow>
              </dl>

              <p className="border-ink/12 text-ink/55 mt-8 border-t pt-6 text-[13px] leading-relaxed">
                Seguramos a mesa por 20 minutos após o horário reservado. Se
                atrasar, é só avisar — a gente entende trânsito de Curitiba.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  termo,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  termo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon aria-hidden className="text-olive mt-0.5 size-[18px] shrink-0" />
      <div>
        <dt className="text-ink text-[11px] font-medium tracking-[0.18em] uppercase">
          {termo}
        </dt>
        <dd className="text-ink/70 mt-1.5 text-[14.5px] leading-relaxed">
          {children}
        </dd>
      </div>
    </div>
  );
}
