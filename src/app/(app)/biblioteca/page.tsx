import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/features/news/feed-list";

export const metadata: Metadata = { title: "Biblioteca" };

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-black">Biblioteca</h1>
      <EmptyState icon={BookOpen} title="A biblioteca abre em breve" text="Guias, artigos e materiais educativos estão sendo preparados." />
    </div>
  );
}
