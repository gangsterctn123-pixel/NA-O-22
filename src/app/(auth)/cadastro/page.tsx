import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { isSupabaseConfigured } from "@/lib/config/env";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <AuthShell title="Crie sua conta" subtitle="Notícias, análises e comunidade em um só lugar.">
      <SignUpForm disabled={!isSupabaseConfigured} />
    </AuthShell>
  );
}
