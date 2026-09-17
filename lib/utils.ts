export { cn } from "cn";

/** Formata um número como moeda brasileira: 124 → "R$ 124,00". */
export function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Formata uma data `YYYY-MM-DD` vinda do Postgres sem passar por fuso —
 * `new Date("2026-07-18")` seria interpretada como UTC e voltaria um dia
 * no horário de Brasília.
 */
export function formatDateBR(
  data: string,
  opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" },
): string {
  const [ano, mes, dia] = data.split("T")[0].split("-").map(Number);
  if (!ano || !mes || !dia) return data;
  return new Intl.DateTimeFormat("pt-BR", { ...opcoes, timeZone: "UTC" }).format(
    new Date(Date.UTC(ano, mes - 1, dia)),
  );
}

/** "19:30:00" → "19:30" */
export function formatTimeBR(hora: string): string {
  return hora.slice(0, 5);
}

/** Data de hoje em `YYYY-MM-DD` no fuso de São Paulo. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Gera um slug URL-safe a partir de um texto livre. */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
