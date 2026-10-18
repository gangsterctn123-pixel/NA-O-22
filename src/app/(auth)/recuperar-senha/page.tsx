import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/config/env";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha.">
      <ForgotPasswordForm disabled={!isSupabaseConfigured} />
    </AuthShell>
  );
}
