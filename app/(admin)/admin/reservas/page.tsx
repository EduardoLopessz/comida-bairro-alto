import { Suspense } from "react";

import { PageHeading } from "@/components/admin/page-heading";
import { ReservationFilters } from "@/components/admin/reservation-filters";
import { ReservationsTable } from "@/components/admin/reservations-table";
import { Skeleton } from "@/components/ui/skeleton";
import { clienteAdmin } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reservas" };

export default async function AdminReservasPage({
  searchParams,
}: PageProps<"/admin/reservas">) {
  const params = await searchParams;

  const periodo =
    typeof params.periodo === "string" ? params.periodo : "proximas";
  const status = typeof params.status === "string" ? params.status : "todos";
  const dataEspecifica = typeof params.data === "string" ? params.data : "";

  const supabase = await clienteAdmin();
  const hoje = todayISO();

  let query = supabase.from("reservations").select("*");

  if (dataEspecifica) {
    query = query.eq("data", dataEspecifica);
  } else if (periodo === "hoje") {
    query = query.eq("data", hoje);
  } else if (periodo === "proximas") {
    query = query.gte("data", hoje);
  } else if (periodo === "passadas") {
    query = query.lt("data", hoje);
  }

  if (status !== "todos") {
    query = query.eq("status", status as ReservationStatus);
  }

  // Passadas em ordem decrescente (o mais recente primeiro); o resto,
  // cronológico — é como o maître lê a agenda.
  const ascendente = periodo !== "passadas";
  const { data, error } = await query
    .order("data", { ascending: ascendente })
    .order("hora", { ascending: ascendente })
    .limit(300);

  const reservas = (data ?? []) as Reservation[];

  const resumo = reservas.reduce(
    (acc, r) => {
      acc.total += 1;
      acc.pessoas += r.pessoas;
      if (r.status === "pendente") acc.pendentes += 1;
      return acc;
    },
    { total: 0, pessoas: 0, pendentes: 0 },
  );

  return (
    <>
      <PageHeading
        titulo="Reservas"
        descricao="Confirme, cancele e acompanhe a agenda da casa. As alterações aparecem no site na hora."
      />

      <Suspense fallback={<Skeleton className="mb-6 h-[118px] w-full" />}>
        <ReservationFilters />
      </Suspense>

      {error ? (
        <div className="border-destructive/30 bg-destructive/8 text-destructive border px-5 py-4 text-[14px]">
          Não foi possível carregar as reservas: {error.message}
        </div>
      ) : (
        <>
          <p className="text-ink/55 mb-4 text-[13px]">
            <strong className="text-ink font-medium">{resumo.total}</strong>{" "}
            {resumo.total === 1 ? "reserva" : "reservas"} ·{" "}
            <strong className="text-ink font-medium">{resumo.pessoas}</strong>{" "}
            {resumo.pessoas === 1 ? "pessoa" : "pessoas"}
            {resumo.pendentes > 0 && (
              <>
                {" "}
                ·{" "}
                <strong className="text-wine font-medium">
                  {resumo.pendentes}
                </strong>{" "}
                aguardando confirmação
              </>
            )}
          </p>

          <ReservationsTable reservas={reservas} />
        </>
      )}
    </>
  );
}
