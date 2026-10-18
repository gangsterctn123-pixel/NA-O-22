import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/landing/site-footer";

export function SimplePage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Voltar ao início"><Logo /></Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Início
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted">Última atualização: {updated}</p>}
        <div className="mt-8 space-y-5 leading-relaxed text-muted [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function DraftNotice() {
  return (
    <p className="rounded-xl border border-dashed border-gold-500 bg-gold-400/10 p-4 text-sm text-foreground">
      <strong>Modelo em revisão.</strong> Este texto é uma minuta de referência e deve ser revisado por assessoria
      jurídica antes do lançamento público.
    </p>
  );
}
