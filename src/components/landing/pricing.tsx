import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const benefits = [
  "Acesso completo ao feed de notícias",
  "Seu Resumo do Dia e briefings exclusivos",
  "Análises aprofundadas e “Entenda a Notícia”",
  "Comunidade privada com todas as salas",
  "Biblioteca premium selecionada",
  "Notificações personalizadas",
];

export function Pricing({ priceCents, demoMode }: { priceCents: number; demoMode: boolean }) {
  return (
    <section id="assinatura" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Assinatura"
          title="Um preço simples, sem surpresas"
          description="Renovação mensal automática. Cancele a qualquer momento pela sua conta."
        />
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-navy-900/10">
          <div className="bg-navy-900 p-8 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Membro NAÇÃO 22</h3>
              <Badge variant="gold" className="bg-gold-400 text-navy-900">Mais completo</Badge>
            </div>
            <p className="mt-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold tracking-tight" data-testid="price">{formatBRL(priceCents)}</span>
              <span className="mb-1.5 text-white/70">/mês</span>
            </p>
            <p className="mt-2 text-sm text-white/70">Cobrança mensal recorrente. Sem fidelidade.</p>
          </div>
          <div className="p-8">
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full">
              <Link href="/cadastro?plano=mensal">Começar minha assinatura</Link>
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" aria-hidden /> Pagamento processado pela Stripe. Não armazenamos dados do cartão.
            </p>
            {demoMode && (
              <p className="mt-3 rounded-lg border border-dashed border-gold-500 bg-gold-400/10 p-2 text-center text-xs font-medium">
                Ambiente de demonstração: nenhuma cobrança real será feita.
              </p>
            )}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted">
          Conteúdos especiais da biblioteca podem ser adquiridos separadamente, a partir de {formatBRL(590)}, e ficam
          na sua biblioteca conforme os termos de aquisição.
        </p>
      </div>
    </section>
  );
}
