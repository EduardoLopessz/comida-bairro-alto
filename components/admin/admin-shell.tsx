"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { sair } from "@/app/(admin)/login/actions";
import { Logo } from "@/components/site/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Só fica ativo no caminho exato (a raiz do painel). */
  exato?: boolean;
};

const LINKS: AdminLink[] = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exato: true },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/galeria", label: "Galeria", icon: Images },
  { href: "/admin/conteudo", label: "Conteúdo", icon: FileText },
];

/**
 * Shell do painel: sidebar verde oliva fixa no desktop, drawer no mobile.
 *
 * Decisão: o admin usa a mesma paleta da marca, mas com fundo claro
 * (paper-light) na área de trabalho em vez do bege texturizado do site.
 * Uso diário pede superfície neutra e alto contraste, não atmosfera.
 */
export function AdminShell({
  children,
  usuario,
}: {
  children: React.ReactNode;
  usuario: { email: string; nome: string | null };
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const iniciais = (usuario.nome ?? usuario.email)
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const nav = (
    <>
      <div className="px-5 pt-6 pb-5">
        <Logo className="text-paper-light" href="/admin" />
      </div>

      <nav aria-label="Navegação do painel" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {LINKS.map((link) => {
            const ativo = link.exato
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setAberto(false)}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[14px] transition-colors",
                    ativo
                      ? "bg-paper-light/14 text-paper-light font-medium"
                      : "text-paper/70 hover:bg-paper-light/8 hover:text-paper-light",
                  )}
                >
                  <Icon aria-hidden="true" className="size-[17px] shrink-0" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-paper/15 mt-6 border-t pt-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/60 hover:bg-paper-light/8 hover:text-paper-light flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13.5px] transition-colors"
          >
            <ExternalLink aria-hidden="true" className="size-[16px] shrink-0" />
            Ver o site
          </a>
        </div>
      </nav>

      <div className="border-paper/15 mt-auto border-t p-4">
        <div className="flex items-center gap-3 px-1">
          <span
            aria-hidden="true"
            className="bg-paper-light/15 text-paper-light flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-medium"
          >
            {iniciais}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-paper-light truncate text-[13px] font-medium">
              {usuario.nome ?? "Equipe"}
            </p>
            <p className="text-paper/55 truncate text-[11.5px]">
              {usuario.email}
            </p>
          </div>
        </div>

        <form action={sair} className="mt-3">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-paper/70 hover:bg-paper-light/10 hover:text-paper-light w-full justify-start gap-3 px-3 text-[13.5px]"
          >
            <LogOut aria-hidden="true" className="size-[16px]" />
            Sair
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <div className="bg-paper-light flex min-h-svh">
      {/* Sidebar desktop */}
      <aside className="bg-olive fixed inset-y-0 left-0 hidden w-[250px] flex-col lg:flex">
        {nav}
      </aside>

      {/* Drawer mobile */}
      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-[#1c241d]/60"
          />
          <aside className="bg-olive absolute inset-y-0 left-0 flex w-[270px] flex-col">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar menu"
              onClick={() => setAberto(false)}
              className="text-paper/70 hover:bg-paper-light/10 hover:text-paper-light absolute top-4 right-3"
            >
              <X className="size-5" />
            </Button>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[250px]">
        {/* Topbar mobile */}
        <header className="border-ink/10 bg-paper-light sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu do painel"
            onClick={() => setAberto(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Logo compact className="text-olive" href="/admin" />
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
