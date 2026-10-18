import type { Metadata } from "next";
import { Users } from "lucide-react";
import { EmptyState } from "@/features/news/feed-list";

export const metadata: Metadata = { title: "Comunidade" };

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-black">Comunidade</h1>
      <EmptyState icon={Users} title="A comunidade abre em breve" text="As salas de debate entre membros estão em construção." />
    </div>
  );
}
