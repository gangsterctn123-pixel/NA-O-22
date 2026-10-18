import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido."));

const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
  .regex(/\d/, "A senha deve conter pelo menos um número.");

const passwordsMatch = {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
  // compara mesmo quando outros campos ainda têm erro (feedback completo de uma vez)
  when: (payload: { value: unknown }) => {
    const v = payload.value as { password?: unknown; confirmPassword?: unknown };
    return typeof v?.password === "string" && typeof v?.confirmPassword === "string";
  },
};

export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo.")
      .max(80, "O nome deve ter no máximo 80 caracteres.")
      .refine((v) => v.split(/\s+/).length >= 2, "Informe nome e sobrenome."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(USERNAME_REGEX, "Use de 3 a 20 caracteres: letras minúsculas, números ou _."),
    email,
    password,
    confirmPassword: z.string(),
    terms: z.literal("on", { error: "É necessário aceitar os Termos de uso e a Política de privacidade." }),
  })
  .refine((d) => d.password === d.confirmPassword, passwordsMatch);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
  next: z.string().optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, passwordsMatch);

export type FieldErrors = Partial<Record<string, string>>;

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: FieldErrors; values?: Record<string, string> }
  | { status: "success"; message: string; email?: string };

/** Converte erros do zod em { campo: primeira mensagem }. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
