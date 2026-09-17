import { Eyebrow, SectionRule } from "@/components/site/brand";
import { Reveal } from "@/components/site/motion-primitives";

/**
 * Cabeçalho editorial das páginas internas. Reserva o espaço do header
 * fixo (pt-[68px]) e mantém o mesmo ritmo tipográfico em todo o site.
 */
export function PageHeader({
  eyebrow,
  titulo,
  destaque,
  descricao,
  rule = true,
}: {
  eyebrow: string;
  /** Parte do título em romano. */
  titulo: string;
  /** Parte final do título, renderizada em itálico. */
  destaque?: string;
  descricao?: string;
  rule?: boolean;
}) {
  return (
    <header className="mx-auto w-full max-w-[1400px] px-5 pt-[calc(68px+5rem)] pb-14 sm:px-8 sm:pt-[calc(68px+7rem)]">
      <Reveal>
        <Eyebrow className="text-wine">{eyebrow}</Eyebrow>
        <h1 className="font-heading mt-5 max-w-3xl text-[clamp(2.3rem,6vw,4.2rem)] leading-[1.02] tracking-[-0.02em]">
          {titulo}
          {destaque && (
            <>
              {" "}
              <em className="italic">{destaque}</em>
            </>
          )}
        </h1>
        {descricao && (
          <p className="text-ink/70 mt-6 max-w-xl text-[16.5px] leading-[1.7]">
            {descricao}
          </p>
        )}
      </Reveal>
      {rule && <SectionRule className="text-ink mt-14" />}
    </header>
  );
}
