import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/config/env";
import { FormAlert } from "./form-fields";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
        <Link href="/" aria-label="NAÇÃO 22 — página inicial">
          <Logo />
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-[#555555] hover:text-black">
          <ArrowLeft className="size-4" aria-hidden /> Início
        </Link>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-black">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[#555555]">{subtitle}</p>}
            {!isSupabaseConfigured && (
              <div className="mt-5" data-testid="auth-unavailable">
                <FormAlert tone="info">
                  O acesso está temporariamente indisponível enquanto concluímos a configuração.
                  {process.env.NODE_ENV !== "production" && (
                    <span className="mt-1 block text-xs">
                      Dev: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.
                    </span>
                  )}
                </FormAlert>
              </div>
            )}
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-6 text-center text-xs text-[#555555]">
            Plataforma independente, sem vínculo com partidos ou candidatos.
          </p>
        </div>
      </div>
    </main>
  );
}
