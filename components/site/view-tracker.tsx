"use client";

import { useEffect } from "react";

const CHAVE = "cba:menu-visto";

/**
 * Conta uma visualização por prato, uma vez por sessão de navegador.
 *
 * Roda depois da hidratação e nunca bloqueia a página: se o fetch falhar
 * ou o sessionStorage estiver indisponível (aba anônima com storage
 * bloqueado), o site continua igual — só a métrica deixa de ser registrada.
 */
export function ViewTracker({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (ids.length === 0) return;

    // Ids de fallback (quando o banco ainda não respondeu) não são UUID
    // e não devem ser enviados.
    const UUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validos = ids.filter((id) => UUID.test(id));
    if (validos.length === 0) return;

    try {
      if (sessionStorage.getItem(CHAVE)) return;
      sessionStorage.setItem(CHAVE, "1");
    } catch {
      return;
    }

    const controller = new AbortController();
    // Um pequeno atraso tira o request do caminho crítico da navegação.
    const timer = setTimeout(() => {
      fetch("/api/menu-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: validos }),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => {
        // silencioso de propósito
      });
    }, 1200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ids]);

  return null;
}
