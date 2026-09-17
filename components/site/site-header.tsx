"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Logo } from "@/components/site/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/sobre", label: "Sobre" },
  { href: "/galeria", label: "Galeria" },
  { href: "/novidades", label: "Novidades" },
  { href: "/contato", label: "Contato" },
] as const;

/**
 * Header fixo translúcido. Fica transparente sobre o hero e ganha fundo
 * de papel + filete assim que a página rola — mantém o hero limpo sem
 * abrir mão da legibilidade no resto do site.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const transparentStart = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !transparentStart;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "bg-paper/88 border-ink/10 border-b backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Logo
          className={cn(
            "transition-colors duration-500",
            solid ? "text-olive" : "text-paper-light",
          )}
        />

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1 text-[13.5px] tracking-wide transition-colors duration-300",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                  solid ? "text-ink/75 hover:text-olive" : "text-paper-light/85 hover:text-paper-light",
                  active && "after:scale-x-100",
                  active && (solid ? "text-olive" : "text-paper-light"),
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className={cn(
              "hidden rounded-none px-5 text-[12.5px] tracking-[0.12em] uppercase transition-colors sm:inline-flex",
              solid
                ? "bg-wine hover:bg-wine-light text-paper-light"
                : "bg-paper-light/95 text-olive hover:bg-paper-light",
            )}
          >
            <Link href="/reservas">Reservar mesa</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu de navegação"
                className={cn(
                  "md:hidden",
                  solid ? "text-ink hover:bg-ink/5" : "text-paper-light hover:bg-white/10",
                )}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-paper border-ink/10 w-[84vw] sm:w-[380px]">
              <SheetHeader className="border-ink/10 border-b">
                <SheetTitle className="text-left">
                  <Logo href={null} className="text-olive" />
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Navegação principal" className="flex flex-col px-4 py-2">
                {NAV.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="border-ink/8 text-ink/85 hover:text-olive font-heading border-b py-4 text-[22px] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto p-4">
                <SheetClose asChild>
                  <Button
                    asChild
                    className="bg-wine hover:bg-wine-light text-paper-light w-full rounded-none py-6 text-[12.5px] tracking-[0.12em] uppercase"
                  >
                    <Link href="/reservas">Reservar mesa</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
