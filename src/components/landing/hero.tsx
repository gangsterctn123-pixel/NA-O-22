import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneMockup } from "./phone-mockup";
import { formatBRL } from "@/lib/utils";

export function Hero({ priceCents }: { priceCents: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-gradient-to-b from-surface to-background" />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="animate-fade-up">
          <Badge variant="green" className="mb-6">
            <ShieldCheck aria-hidden /> Plataforma independente · fontes sempre citadas
          </Badge>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            A política brasileira <span className="relative whitespace-nowrap text-primary">em um só lugar.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Notícias selecionadas todos os dias, resumos claros com auxílio de inteligência artificial,
            acompanhamento do Congresso e uma comunidade privada para debater com quem pensa o Brasil.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cadastro">
                Assinar por {formatBRL(priceCents)}/mês <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#funcionalidades">Conhecer a plataforma</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">Cancele quando quiser. Sem fidelidade.</p>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}
