import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Clock,
  Eye,
  UtensilsCrossed,
} from "lucide-react";

import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clienteAdmin } from "@/lib/auth";
import { formatDateBR, formatTimeBR, todayISO } from "@/lib/utils";
import {
  RESERVATION_STATUS_LABEL,
  type Reservation,
  type ReservationStatus,
} from "@/types/database";

export const dynamic = "force-dynamic";

const CORES_STATUS: Record<ReservationStatus, string> = {
  pendente: "bg-[#B08968]/15 text-[#7a5a3c] border-[#B08968]/30",
  confirmada: "bg-olive/12 text-olive border-olive/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/25",
  concluida: "bg-ink/8 text-ink/60 border-ink/20",
};

export default async function AdminDashboard() {
  const supabase = await clienteAdmin();
  const hoje = todayISO();

  // Uma consulta por métrica, em paralelo. `head: true` traz só a contagem.
  const [
    reservasHoje,
    pendentes,
    confirmadasFuturas,
    totalPratos,
    proximas,
    maisVistos,
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("data", hoje),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmada")
      .gte("data", hoje),
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("disponivel", true),
    supabase
      .from("reservations")
      .select("*")
      .gte("data", hoje)
      .neq("status", "cancelada")
      .order("data", { ascending: true })
      .order("hora", { ascending: true })
      .limit(8),
    supabase
      .from("menu_items")
      .select("id, nome, visualizacoes")
      .order("visualizacoes", { ascending: false })
      .limit(5),
  ]);

  const metricas = [
    {
      label: "Reservas hoje",
      valor: reservasHoje.count ?? 0,
      icone: CalendarDays,
      hint: formatDateBR(hoje, { day: "2-digit", month: "long" }),
    },
    {
      label: "Aguardando confirmação",
      valor: pendentes.count ?? 0,
      icone: Clock,
      hint: "Precisam de resposta",
      destaque: (pendentes.count ?? 0) > 0,
    },
    {
      label: "Confirmadas à frente",
      valor: confirmadasFuturas.count ?? 0,
      icone: CalendarCheck,
      hint: "De hoje em diante",
    },
    {
      label: "Pratos na carta",
      valor: totalPratos.count ?? 0,
      icone: UtensilsCrossed,
      hint: "Disponíveis agora",
    },
  ];

  const proximasReservas = (proximas.data ?? []) as Reservation[];
  const pratosVistos = (maisVistos.data ?? []) as Array<{
    id: string;
    nome: string;
    visualizacoes: number;
  }>;
  const maxViews = Math.max(1, ...pratosVistos.map((p) => p.visualizacoes));

  return (
    <>
      <PageHeading
        titulo="Visão geral"
        descricao="O movimento da casa hoje e o que precisa da sua atenção."
        acao={
          <Button
            asChild
            className="bg-olive hover:bg-olive-light text-paper-light rounded-none"
          >
            <Link href="/admin/reservas">Ver reservas</Link>
          </Button>
        }
      />

      {/* --------------------------------------------------------- MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((m) => {
          const Icon = m.icone;
          return (
            <div
              key={m.label}
              className={`border-ink/12 bg-paper/50 border p-5 ${
                m.destaque ? "border-wine/40 bg-wine/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-ink/60 text-[12px] tracking-[0.06em] uppercase">
                  {m.label}
                </p>
                <Icon
                  aria-hidden="true"
                  className={`size-[18px] shrink-0 ${
                    m.destaque ? "text-wine" : "text-olive/60"
                  }`}
                />
              </div>
              <p className="font-heading text-ink mt-3 text-[38px] leading-none tabular-nums">
                {m.valor}
              </p>
              <p className="text-ink/45 mt-2 text-[12px]">{m.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* ------------------------------------------------ PRÓXIMAS RESERVAS */}
        <section className="border-ink/12 bg-paper/50 border">
          <header className="border-ink/10 flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-ink text-[14px] font-medium">
              Próximas reservas
            </h2>
            <Link
              href="/admin/reservas"
              className="text-wine hover:text-wine-light group inline-flex items-center gap-1.5 text-[12.5px] transition-colors"
            >
              Todas
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </header>

          {proximasReservas.length === 0 ? (
            <p className="text-ink/50 px-5 py-14 text-center text-[14px]">
              Nenhuma reserva marcada de hoje em diante.
            </p>
          ) : (
            <ul className="divide-ink/8 divide-y">
              {proximasReservas.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
                >
                  <div className="w-[88px] shrink-0">
                    <p className="text-ink text-[13px] font-medium tabular-nums">
                      {formatDateBR(r.data, { day: "2-digit", month: "2-digit" })}
                    </p>
                    <p className="text-ink/50 text-[12px] tabular-nums">
                      {formatTimeBR(r.hora)}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-[14px]">{r.nome}</p>
                    <p className="text-ink/50 truncate text-[12.5px]">
                      {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"} ·{" "}
                      {r.telefone}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`shrink-0 rounded-none text-[11px] font-normal ${CORES_STATUS[r.status]}`}
                  >
                    {RESERVATION_STATUS_LABEL[r.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ------------------------------------------------- PRATOS MAIS VISTOS */}
        <section className="border-ink/12 bg-paper/50 border">
          <header className="border-ink/10 flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-ink text-[14px] font-medium">
              Pratos mais vistos
            </h2>
            <Eye aria-hidden="true" className="text-olive/60 size-4" />
          </header>

          {pratosVistos.length === 0 ? (
            <p className="text-ink/50 px-5 py-14 text-center text-[14px]">
              Sem dados de visualização ainda.
            </p>
          ) : (
            <ul className="space-y-4 px-5 py-5">
              {pratosVistos.map((p) => (
                <li key={p.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-ink truncate text-[13.5px]">
                      {p.nome}
                    </span>
                    <span className="text-ink/55 shrink-0 text-[12.5px] tabular-nums">
                      {p.visualizacoes}
                    </span>
                  </div>
                  <div
                    className="bg-ink/8 mt-1.5 h-1"
                    role="presentation"
                  >
                    <div
                      className="bg-olive h-full transition-[width] duration-700"
                      style={{
                        width: `${Math.round((p.visualizacoes / maxViews) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="border-ink/10 text-ink/45 border-t px-5 py-3.5 text-[11.5px] leading-relaxed">
            Contagem registrada quando o prato aparece na página de cardápio.
          </p>
        </section>
      </div>
    </>
  );
}
