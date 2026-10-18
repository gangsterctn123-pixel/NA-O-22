import { Bookmark, Clock, ExternalLink, FileText, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBadge } from "@/components/ui/demo-badge";
import { SectionHeading } from "./section-heading";

/**
 * Prévia do feed e do radar. Os itens são MODELOS DE LAYOUT, não notícias:
 * títulos genéricos, sem pessoas, datas ou fatos reais, e com selo "Exemplo demonstrativo".
 */
const demoNews = [
  { category: "Congresso", type: "Fato", title: "Exemplo de manchete: como uma notícia aparece no seu feed", minutes: 4 },
  { category: "Economia", type: "Análise", title: "Exemplo de análise: indicadores explicados em linguagem simples", minutes: 6 },
  { category: "Justiça", type: "Fato", title: "Exemplo de manchete com fonte original e contexto histórico", minutes: 3 },
];

const demoRadar = [
  { code: "PL 0000/0000", body: "Câmara dos Deputados", status: "Situação conforme fonte oficial", kind: "Projeto de lei" },
  { code: "Votação nº 000", body: "Senado Federal", status: "Resultado conforme fonte oficial", kind: "Votação" },
];

export function NewsRadarPreview() {
  return (
    <section id="radar" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Notícias e Radar"
          title="Leia rápido. Aprofunde quando quiser."
          description="Cada notícia mostra fonte, data, tempo de leitura e se é fato, análise ou opinião."
        />

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {demoNews.map((n) => (
              <Card key={n.title} className="flex gap-4 p-4">
                <div className="hidden size-24 shrink-0 rounded-xl bg-gradient-to-br from-navy-900 to-navy-700 sm:block" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="green">{n.category}</Badge>
                    <Badge variant="outline">{n.type}</Badge>
                    <DemoBadge />
                  </div>
                  <h3 className="mt-2 font-bold leading-snug">{n.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted">
                    <span className="flex items-center gap-3">
                      <span>Fonte: nome da fonte original</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden /> {n.minutes} min
                      </span>
                    </span>
                    <span className="flex gap-2" aria-hidden>
                      <Bookmark className="size-4" />
                      <Share2 className="size-4" />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-navy-900 p-6 text-white dark:bg-card">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <FileText className="size-5 text-gold-400" aria-hidden /> Radar Político
              </h3>
              <DemoBadge className="text-gold-400" />
            </div>
            <p className="mt-2 text-sm text-white/70">
              Dados obtidos de fontes oficiais, como os portais de dados abertos da Câmara e do Senado.
            </p>
            <ul className="mt-6 space-y-3">
              {demoRadar.map((r) => (
                <li key={r.code} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wide text-gold-400">{r.kind}</span>
                    <span className="text-white/60">{r.body}</span>
                  </div>
                  <p className="mt-1 font-mono text-sm font-bold">{r.code}</p>
                  <p className="mt-1 text-sm text-white/70">{r.status}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-400">
                    <ExternalLink className="size-3" aria-hidden /> Link para a fonte oficial
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
