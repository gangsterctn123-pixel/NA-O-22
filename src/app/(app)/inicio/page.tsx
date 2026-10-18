import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/features/auth/session";
import { FormAlert } from "@/features/auth/components/form-fields";
import { FeedList } from "@/features/news/feed-list";
import { getLatestArticles } from "@/features/news/queries";

export const metadata: Metadata = { title: "Início" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
}

export default async function HomeFeedPage({ searchParams }: PageProps<"/inicio">) {
  const [{ user, profile }, params, feed] = await Promise.all([requireUser(), searchParams, getLatestArticles(10)]);
  const firstName = (profile?.full_name ?? user.email ?? "").split(/[\s@]/)[0];

  return (
    <div className="space-y-8">
      {params.senha === "atualizada" && <FormAlert tone="success">Sua senha foi atualizada.</FormAlert>}

      <header>
        <p className="text-sm font-semibold text-[#555555]">{greeting()},</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-black" data-testid="home-greeting">
          {firstName}
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-white p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
          <Sparkles className="size-4" aria-hidden /> Seu Resumo do Dia
        </p>
        <p className="mt-1 text-[#555555]">O briefing diário com os cinco principais assuntos chega em breve.</p>
        <div className="mt-3 flex gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-gold-400" : "bg-black/10"}`} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-extrabold text-black">Últimas notícias</h2>
          <Link href="/noticias" className="text-sm font-semibold text-brand-blue hover:underline">
            Ver todas
          </Link>
        </div>
        <FeedList articles={feed.articles} error={feed.error} />
      </section>
    </div>
  );
}
