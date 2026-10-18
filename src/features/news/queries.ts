import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FeedArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover_url: string | null;
  reading_minutes: number;
  content_type: "fact" | "analysis" | "opinion";
  published_at: string;
  is_demo: boolean;
  categories: { name: string } | null;
  article_sources: { source_name: string; url: string; is_primary: boolean }[];
};

/** Últimas notícias publicadas. O RLS já filtra rascunhos e conteúdo premium sem assinatura. */
export async function getLatestArticles(limit = 20): Promise<{ articles: FeedArticle[]; error: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, slug, title, summary, cover_url, reading_minutes, content_type, published_at, is_demo, categories(name), article_sources(source_name, url, is_primary)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit)
    .overrideTypes<FeedArticle[], { merge: false }>();

  if (error) {
    console.error(JSON.stringify({ scope: "news", event: "feed_query_failed", code: error.code }));
    return { articles: [], error: true };
  }
  return { articles: data ?? [], error: false };
}
