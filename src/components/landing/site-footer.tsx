import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border pb-28 pt-12 lg:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <Logo showSlogan />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Rodapé">
            <Link href="/termos" className="hover:text-foreground">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link href="/regras" className="hover:text-foreground">Regras da comunidade</Link>
            <Link href="/suporte" className="hover:text-foreground">Suporte</Link>
          </nav>
        </div>
        <p className="mt-8 rounded-xl border border-border bg-card p-4 text-sm text-muted" data-testid="independence-notice">
          <strong className="text-foreground">Aviso de independência.</strong> {site.independenceNotice}
        </p>
        <p className="mt-6 text-xs text-muted">© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
