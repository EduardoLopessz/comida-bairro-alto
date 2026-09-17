"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { entrar, type LoginState } from "@/app/(admin)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  destino,
  erroInicial,
}: {
  destino: string;
  erroInicial?: string;
}) {
  const [estado, formAction] = useActionState<LoginState, FormData>(entrar, {
    erro: erroInicial,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={destino} />

      <div>
        <Label htmlFor="email" className="text-ink/80 text-[13px] font-medium">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-11 rounded-none text-[15px]"
        />
      </div>

      <div>
        <Label htmlFor="senha" className="text-ink/80 text-[13px] font-medium">
          Senha
        </Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="border-ink/20 bg-paper focus-visible:border-olive mt-2 h-11 rounded-none text-[15px]"
        />
      </div>

      {estado.erro && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive border px-3.5 py-2.5 text-[13px]"
        >
          {estado.erro}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-olive hover:bg-olive-light text-paper-light w-full rounded-none py-5.5 text-[12.5px] tracking-[0.12em] uppercase"
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Entrando…
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}
