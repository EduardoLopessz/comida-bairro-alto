import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { exigirAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  robots: { index: false, follow: false },
};

/**
 * Segunda camada de proteção — o proxy já redirecionou quem não tem sessão,
 * e aqui confirmamos que o usuário está mesmo na tabela `admin_users`.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const usuario = await exigirAdmin();

  return (
    <AdminShell usuario={{ email: usuario.email, nome: usuario.nome }}>
      {children}
    </AdminShell>
  );
}
