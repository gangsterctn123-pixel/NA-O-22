import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha" };
export const dynamic = "force-dynamic";

// Acessada pelo link de recuperação (que cria a sessão) ou pelo perfil, logado.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/redefinir-senha");

  return (
    <AuthShell title="Criar nova senha" subtitle={`Conta: ${user.email ?? ""}`}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
