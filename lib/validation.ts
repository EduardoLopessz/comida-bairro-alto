import { z } from "zod";

/**
 * Schema de reserva compartilhado entre o formulário (client) e a Server
 * Action (server). Validar dos dois lados evita round-trip desnecessário
 * e garante que o banco nunca receba lixo, mesmo com JS desligado.
 *
 * As regras de horário refletem os turnos reais da casa — ver
 * SERVICE_WINDOWS abaixo.
 */

/** Horários oferecidos no seletor, por turno. */
export const SERVICE_WINDOWS = {
  almoco: ["12:00", "12:30", "13:00", "13:30", "14:00"],
  jantar: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
} as const;

export const ALL_TIMES = [
  ...SERVICE_WINDOWS.almoco,
  ...SERVICE_WINDOWS.jantar,
];

/** Segunda-feira (getUTCDay() === 1) a casa não abre. */
export const CLOSED_WEEKDAY = 1;

export const reservationSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe um e-mail para a confirmação.")
    .email("E-mail inválido."),
  telefone: z
    .string()
    .trim()
    .min(8, "Informe um telefone com DDD.")
    .max(30, "Telefone inválido.")
    .regex(/^[\d\s()+-]+$/, "Use apenas números, espaços e ( ) + -."),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha uma data.")
    .refine((valor) => {
      const [a, m, d] = valor.split("-").map(Number);
      return new Date(Date.UTC(a, m - 1, d)).getUTCDay() !== CLOSED_WEEKDAY;
    }, "Às segundas-feiras a casa está fechada."),
  hora: z.enum(ALL_TIMES as [string, ...string[]], {
    message: "Escolha um horário disponível.",
  }),
  pessoas: z.coerce
    .number()
    .int("Número de pessoas inválido.")
    .min(1, "Pelo menos uma pessoa.")
    .max(20, "Para grupos acima de 20, fale com a gente pelo WhatsApp."),
  observacoes: z
    .string()
    .trim()
    .max(600, "Observação muito longa (máx. 600 caracteres).")
    .optional()
    .or(z.literal("")),
});

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationData = z.output<typeof reservationSchema>;

/** A data escolhida precisa ser hoje ou no futuro, no fuso de São Paulo. */
export function isPastDate(data: string, hojeISO: string): boolean {
  return data < hojeISO;
}
