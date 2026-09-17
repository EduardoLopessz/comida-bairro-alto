import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeading } from "@/components/admin/page-heading";
import { clienteAdmin } from "@/lib/auth";
import type { SiteContent } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Conteúdo" };

export default async function AdminConteudoPage() {
  const supabase = await clienteAdmin();

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .order("grupo", { ascending: true })
    .order("ordem", { ascending: true });

  const campos = (data ?? []) as SiteContent[];

  return (
    <>
      <PageHeading
        titulo="Conteúdo do site"
        descricao="Textos institucionais, horários e dados de contato. Tudo o que muda sem precisar de programador."
      />

      {error ? (
        <div className="border-destructive/30 bg-destructive/8 text-destructive border px-5 py-4 text-[14px]">
          Não foi possível carregar o conteúdo: {error.message}
        </div>
      ) : campos.length === 0 ? (
        <div className="border-ink/12 bg-paper/50 border px-6 py-20 text-center">
          <p className="text-ink/60 text-[15px]">
            Nenhum campo de conteúdo cadastrado.
          </p>
          <p className="text-ink/45 mt-2 text-[13.5px]">
            Rode o seed do banco (<code className="font-mono">npm run db:seed</code>)
            para popular os textos iniciais.
          </p>
        </div>
      ) : (
        <ContentEditor campos={campos} />
      )}
    </>
  );
}
