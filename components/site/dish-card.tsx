import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import { DIET_TAG_LABEL, type MenuItem } from "@/types/database";

/**
 * Card de prato. Duas variantes:
 *  - `vitrine`: foto grande em cima, usada na home e nos destaques;
 *  - `carta`: linha horizontal compacta, usada na página de menu.
 */
export function DishCard({
  item,
  variant = "vitrine",
  priority = false,
}: {
  item: MenuItem;
  variant?: "vitrine" | "carta";
  priority?: boolean;
}) {
  const tags = item.tags?.filter((t) => DIET_TAG_LABEL[t]) ?? [];

  if (variant === "carta") {
    return (
      <article className="group border-ink/10 flex gap-5 border-b py-7 last:border-b-0">
        {item.imagem_url && (
          <div className="bg-paper-deep relative hidden h-[104px] w-[104px] shrink-0 overflow-hidden sm:block">
            <Image
              src={item.imagem_url}
              alt=""
              fill
              sizes="104px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="font-heading text-ink text-[19px] leading-snug">
              {item.nome}
            </h3>
            <span
              aria-hidden="true"
              className="border-ink/20 mb-1 min-w-4 flex-1 border-b border-dotted"
            />
            <span className="text-olive font-heading shrink-0 text-[17px] tabular-nums">
              {formatBRL(item.preco)}
            </span>
          </div>

          {item.descricao && (
            <p className="text-ink/70 mt-2 max-w-2xl text-[14.5px] leading-relaxed">
              {item.descricao}
            </p>
          )}

          {tags.length > 0 && <TagRow tags={tags} className="mt-3" />}
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <div className="bg-paper-deep relative aspect-[4/5] w-full overflow-hidden">
        {item.imagem_url ? (
          <Image
            src={item.imagem_url}
            alt={item.nome}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="text-ink/25 font-heading flex h-full items-center justify-center text-sm italic">
            sem foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-heading text-ink text-[21px] leading-snug">
            {item.nome}
          </h3>
          <span className="text-olive font-heading shrink-0 text-[17px] tabular-nums">
            {formatBRL(item.preco)}
          </span>
        </div>

        {item.descricao && (
          <p className="text-ink/70 mt-2.5 text-[14.5px] leading-relaxed">
            {item.descricao}
          </p>
        )}

        {tags.length > 0 && <TagRow tags={tags} className="mt-4" />}
      </div>
    </article>
  );
}

function TagRow({ tags, className }: { tags: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge
            variant="outline"
            className="border-olive/30 text-olive rounded-none bg-transparent px-2 py-0.5 text-[10.5px] font-normal tracking-[0.1em] uppercase"
          >
            {DIET_TAG_LABEL[tag]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
