import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

import { CutleryOrnament, Logo, TileOrnament } from "@/components/site/brand";

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/sobre", label: "Sobre" },
  { href: "/galeria", label: "Galeria" },
  { href: "/novidades", label: "Novidades" },
  { href: "/reservas", label: "Reservas" },
  { href: "/contato", label: "Contato" },
] as const;

export function SiteFooter({ content }: { content: Record<string, string> }) {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-olive text-paper/85 relative z-10 mt-auto">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div className="max-w-sm">
            <Logo className="text-paper-light" />
            <p className="mt-5 text-sm leading-relaxed">
              Gastronomia contemporânea com raízes na herança de imigração de
              Curitiba. Massa fresca do dia, fogo baixo e mesa de bairro.
            </p>
            <CutleryOrnament className="text-paper/30 mt-7 h-7 w-7" />
          </div>

          <nav aria-label="Navegação do rodapé">
            <h2 className="text-paper-light text-[11px] font-medium tracking-[0.22em] uppercase">
              Navegação
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-paper-light decoration-paper/30 underline-offset-4 transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-paper-light text-[11px] font-medium tracking-[0.22em] uppercase">
              Onde estamos
            </h2>
            <ul className="mt-5 space-y-3.5 text-sm">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-70" />
                <span>
                  {content.contato_endereco}
                  <br />
                  CEP {content.contato_cep}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-70" />
                <a
                  href={`tel:${content.contato_telefone?.replace(/\D/g, "")}`}
                  className="hover:text-paper-light transition-colors"
                >
                  {content.contato_telefone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-70" />
                <a
                  href={`mailto:${content.contato_email}`}
                  className="hover:text-paper-light break-all transition-colors"
                >
                  {content.contato_email}
                </a>
              </li>
              {content.contato_instagram && (
                <li className="flex gap-3">
                  <AtSign aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-70" />
                  <a
                    href={content.contato_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper-light transition-colors"
                  >
                    @comidabairroalto
                  </a>
                </li>
              )}
            </ul>

            <h2 className="text-paper-light mt-8 text-[11px] font-medium tracking-[0.22em] uppercase">
              Horários
            </h2>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>{content.horario_almoco}</li>
              <li>{content.horario_jantar}</li>
              <li className="opacity-65">{content.horario_fechado}</li>
            </ul>
          </div>
        </div>

        <div className="border-paper/15 mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <p className="text-xs opacity-60">
            © {ano} Comida Bairro Alto · Curitiba, Paraná
          </p>
          <TileOrnament className="text-paper/25 h-8 w-8" />
          <Link
            href="/login"
            className="hover:text-paper-light text-xs opacity-60 transition-opacity hover:opacity-100"
          >
            Área da equipe
          </Link>
        </div>
      </div>
    </footer>
  );
}
