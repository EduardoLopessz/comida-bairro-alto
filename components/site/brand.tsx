import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Ilustração linear leve — contorno de azulejo português/ucraniano,
 * desenhada como SVG inline (sem asset externo, herda `currentColor`).
 * Usada como ornamento entre seções e no rodapé.
 */
export function TileOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
    >
      <rect x="4" y="4" width="56" height="56" rx="2" />
      <path d="M32 10c6 8 14 16 22 22-8 6-16 14-22 22-6-8-14-16-22-22 8-6 16-14 22-22Z" />
      <circle cx="32" cy="32" r="7" />
      <path d="M32 25v14M25 32h14" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="52" cy="12" r="1.6" />
      <circle cx="12" cy="52" r="1.6" />
      <circle cx="52" cy="52" r="1.6" />
    </svg>
  );
}

/** Talheres cruzados — ornamento secundário. */
export function CutleryOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <path d="M16 6v12a4 4 0 0 0 4 4v20" />
      <path d="M12 6v10M20 6v10" />
      <path d="M34 6c-3 3-4 7-4 11 0 4 2 6 4 6v19" />
    </svg>
  );
}

/** Marca nominativa. `mark` mostra o monograma quadrado ao lado. */
export function Logo({
  className,
  compact = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="border-current/30 flex h-9 w-9 shrink-0 items-center justify-center border font-heading text-[15px] italic leading-none"
      >
        cba
      </span>
      {!compact && (
        <span className="font-heading text-[17px] leading-tight tracking-tight">
          Comida
          <span className="italic"> Bairro Alto</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label="Comida Bairro Alto — página inicial"
      className="focus-visible:ring-ring rounded-sm transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
    >
      {content}
    </Link>
  );
}

/** Filete decorativo entre seções, com ornamento centralizado. */
export function SectionRule({ className }: { className?: string }) {
  return (
    <div className={cn("rule-ornament", className)} aria-hidden="true">
      <TileOrnament className="h-6 w-6 opacity-60" />
    </div>
  );
}

/** Rótulo pequeno em versalete que abre as seções. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium tracking-[0.22em] uppercase opacity-70",
        className,
      )}
    >
      {children}
    </p>
  );
}
