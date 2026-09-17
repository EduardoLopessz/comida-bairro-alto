export function PageHeading({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="border-ink/10 mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div>
        <h1 className="font-heading text-ink text-[28px] leading-tight sm:text-[32px]">
          {titulo}
        </h1>
        {descricao && (
          <p className="text-ink/60 mt-1.5 max-w-2xl text-[14px] leading-relaxed">
            {descricao}
          </p>
        )}
      </div>
      {acao && <div className="flex shrink-0 gap-2">{acao}</div>}
    </div>
  );
}
