import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { FormAlert } from "@/features/auth/components/form-fields";
import { safeNextPath } from "@/features/auth/routes";
import { isSupabaseConfigured } from "@/lib/config/env";

export const metadata: Metadata = { title: "Entrar" };

const notices: Record<string, { tone: "error" | "success" | "info"; text: string }> = {
  link: { tone: "error", text: "O link é inválido ou expirou. Solicite um novo ou entre com sua senha." },
  indisponivel: { tone: "error", text: "O acesso está temporariamente indisponível." },
  saiu: { tone: "success", text: "Você saiu da sua conta." },
};

export default async function SignInPage({ searchParams }: PageProps<"/entrar">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNextPath(params.next) : undefined;
  const erro = typeof params.erro === "string" ? params.erro : undefined;
  const notice = erro ? notices[erro] ?? notices.link : params.saiu ? notices.saiu : undefined;

  return (
    <AuthShell title="Entrar" subtitle="Bem-vindo de volta à NAÇÃO 22.">
      {notice && (
        <div className="mb-5">
          <FormAlert tone={notice.tone}>{notice.text}</FormAlert>
        </div>
      )}
      <SignInForm next={next} disabled={!isSupabaseConfigured} />
    </AuthShell>
  );
}
