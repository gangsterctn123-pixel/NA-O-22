import { Clock, ExternalLink, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui/demo-badge";
import type { FeedArticle } from "./queries";

const typeLabel = { fact: "Fato", analysis: "Análise", opinion: "Opinião" } as const;
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function FeedList({ articles, error }: { articles: FeedArticle[]; error?: boolean }) {
  if (error) {
    return (
      <EmptyState
        title="Não foi possível carregar as notícias"
        text="Tente novamente em instantes. Se o problema continuar, fale com o suporte."
      />
    );
  }
  if (articles.length === 0) {
    return (
      <EmptyState
        title="Nenhuma notícia publicada ainda"
        text="Assim que a equipe editorial aprovar as primeiras notícias, elas aparecerão aqui."
      />
    );
  }

  return (
    <ul className="space-y-3" data-testid="feed-list">
      {articles.map((a) => {
        const source = a.article_sources.find((s) => s.is_primary) ?? a.article_sources[0];
        return (
          <li key={a.id}>
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                {a.categories && <Badge variant="green">{a.categories.name}</Badge>}
                <Badge variant="outline">{typeLabel[a.content_type]}</Badge>
                {a.is_demo && <DemoBadge />}
              </div>
              <h3 className="mt-2 font-bold leading-snug text-black">{a.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-[#555555]">{a.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#555555]">
                <time dateTime={a.published_at}>{dateFmt.format(new Date(a.published_at))}</time>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden /> {a.reading_minutes} min
                </span>
                {source && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                  >
                    Fonte: {source.source_name} <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState({ title, text, icon: Icon = Newspaper }: { title: string; text: string; icon?: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="mt-4 font-bold text-black">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#555555]">{text}</p>
    </div>
  );
}
