import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { Logo, TileOrnament } from "@/components/site/brand";

export const metadata: Metadata = {
  title: "Área da equipe",
  robots: { index: false, follow: false },
};

const ERROS: Record<string, string> = {
  "sem-acesso": "Esta conta não tem acesso ao painel.",
  config: "O painel não está configurado. Verifique as variáveis de ambiente.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const destino = typeof params.next === "string" ? params.next : "/admin";
  const erroInicial =
    typeof params.erro === "string" ? ERROS[params.erro] : undefined;

  return (
    <main className="bg-paper paper-texture flex min-h-svh items-center justify-center px-5 py-16">
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center">
          <Logo className="text-olive" href="/" />
          <h1 className="font-heading mt-8 text-[30px] leading-tight">
            Área da <em className="italic">equipe</em>
          </h1>
          <p className="text-ink/60 mt-2 text-[14px]">
            Entre para gerenciar cardápio, reservas e conteúdo.
          </p>
        </div>

        <div className="border-ink/12 bg-paper-light mt-9 border p-7">
          <LoginForm destino={destino} erroInicial={erroInicial} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <TileOrnament className="text-olive/25 h-7 w-7" />
          <Link
            href="/"
            className="text-ink/55 hover:text-olive text-[13px] transition-colors"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </main>
  );
}
