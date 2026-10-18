import type { Metadata } from "next";
import Link from "next/link";
import { Construction } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Criar conta" };

// Fase 2: formulário com Supabase Auth.
export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <Link href="/"><Logo /></Link>
      <div className="max-w-sm rounded-2xl border border-border bg-card p-8">
        <Construction className="mx-auto size-8 text-primary" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">Criar conta</h1>
        <p className="mt-2 text-muted">A autenticação será ativada na próxima fase de implementação.</p>
        <Button asChild variant="outline" className="mt-6"><Link href="/">Voltar ao início</Link></Button>
      </div>
    </main>
  );
}
