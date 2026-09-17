import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageTransition } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/data";

export default async function SiteLayout({
  children,
}: LayoutProps<"/">) {
  const content = await getSiteContent();

  return (
    <div className="paper-texture flex min-h-full flex-1 flex-col">
      <a
        href="#conteudo"
        className="bg-olive text-paper-light focus:ring-paper sr-only z-[60] rounded-none px-4 py-2 text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:ring-2"
      >
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main id="conteudo" className="relative z-10 flex flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>

      <SiteFooter content={content} />
    </div>
  );
}
