"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config/env";
import { site } from "@/lib/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { authErrorMessage } from "./errors";
import { AFTER_LOGIN_PATH, safeNextPath } from "./routes";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  type AuthFormState,
} from "./schemas";

type ErrorState = Extract<AuthFormState, { status: "error" }>;

const NOT_CONFIGURED: ErrorState = {
  status: "error",
  message: "O acesso está temporariamente indisponível. Tente novamente mais tarde.",
};

const TOO_MANY: ErrorState = {
  status: "error",
  message: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
};

async function requestContext() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  // Origin do navegador (o Next.js já valida que corresponde ao host em Server Actions)
  const origin = h.get("origin") || site.url;
  return { ip, origin };
}

function log(event: string, data: Record<string, unknown> = {}) {
  // logs estruturados, sem dados pessoais (nada de e-mail ou senha)
  console.info(JSON.stringify({ scope: "auth", event, ...data, at: new Date().toISOString() }));
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { fullName: raw.fullName ?? "", username: raw.username ?? "", email: raw.email ?? "" };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values };

  const { ip, origin } = await requestContext();
  if (!rateLimit(`signup:${ip}`, 5, 10 * 60_000).ok) return { ...TOO_MANY, values };

  const { fullName, username, email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data: available, error: rpcError } = await supabase.rpc("is_username_available", { p_username: username });
  if (rpcError) {
    log("signup_username_check_failed", { code: rpcError.code });
    return { status: "error", message: "Não foi possível verificar o nome de usuário. Tente novamente.", values };
  }
  if (!available) {
    return { status: "error", fieldErrors: { username: "Este nome de usuário já está em uso." }, values };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, username, terms_accepted: true },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(AFTER_LOGIN_PATH)}`,
    },
  });

  if (error) {
    log("signup_failed", { code: error.code, status: error.status });
    // corrida rara: outro cadastro pegou o mesmo usuário entre a checagem e o insert
    if (error.message?.toLowerCase().includes("database error"))
      return { status: "error", fieldErrors: { username: "Este nome de usuário já está em uso." }, values };
    return { status: "error", message: authErrorMessage(error), values };
  }

  log("signup_ok", { confirmed: Boolean(data.session) });
  // Confirmação de e-mail desativada no projeto → já existe sessão: entra direto.
  if (data.session) redirect(AFTER_LOGIN_PATH);

  // Mesma resposta para e-mail novo ou já cadastrado (não revela contas existentes).
  return {
    status: "success",
    email,
    message: "Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar sua conta.",
  };
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { email: raw.email ?? "" };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values };

  const { ip } = await requestContext();
  if (!rateLimit(`signin:${ip}`, 10, 5 * 60_000).ok) return { ...TOO_MANY, values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    log("signin_failed", { code: error.code, status: error.status });
    return { status: "error", message: authErrorMessage(error), values };
  }

  log("signin_ok");
  redirect(safeNextPath(parsed.data.next));
}

export async function forgotPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values };

  const { ip, origin } = await requestContext();
  if (!rateLimit(`forgot:${ip}`, 5, 15 * 60_000).ok) return { ...TOO_MANY, values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) {
    log("forgot_failed", { code: error.code, status: error.status });
    if (error.status === 429 || error.code?.startsWith("over_")) return { status: "error", message: authErrorMessage(error), values };
  }

  // Resposta idêntica exista ou não a conta.
  return {
    status: "success",
    email: parsed.data.email,
    message: "Se houver uma conta com este e-mail, você receberá um link para criar uma nova senha.",
  };
}

export async function resetPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { status: "error", message: "Sua sessão expirou. Solicite um novo link de recuperação." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    log("password_update_failed", { code: error.code, status: error.status });
    return { status: "error", message: authErrorMessage(error) };
  }

  log("password_updated");
  redirect(`${AFTER_LOGIN_PATH}?senha=atualizada`);
}

export async function signOutAction() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/entrar?saiu=1");
}
