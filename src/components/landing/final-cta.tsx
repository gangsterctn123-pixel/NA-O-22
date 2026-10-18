import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-green-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-gold-400/15 blur-3xl" />
          <LogoMark className="mx-auto size-14" />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Informação, Liberdade e Comunidade.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Junte-se a quem acompanha a política brasileira com fontes, contexto e debate qualificado.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/cadastro">
              Criar minha conta <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
