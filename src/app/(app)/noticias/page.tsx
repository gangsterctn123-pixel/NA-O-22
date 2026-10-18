import type { Metadata } from "next";
import { FeedList } from "@/features/news/feed-list";
import { getLatestArticles } from "@/features/news/queries";

export const metadata: Metadata = { title: "Notícias" };

export default async function NewsPage() {
  const feed = await getLatestArticles(30);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-black">Notícias</h1>
        <p className="mt-1 text-[#555555]">Fato, análise e opinião sempre identificados, com a fonte original.</p>
      </header>
      <FeedList articles={feed.articles} error={feed.error} />
    </div>
  );
}
