import { Flag, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui/demo-badge";
import { communityRooms } from "@/lib/config/site";
import { SectionHeading } from "./section-heading";

export function CommunityPreview() {
  return (
    <section id="comunidade" className="scroll-mt-20 bg-surface py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Comunidade NAÇÃO 22"
            title="Debata com respeito, entre membros"
          />
          <div className="-mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {communityRooms.map((room) => (
              <span key={room} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium">
                {room}
              </span>
            ))}
          </div>
          <ul className="mt-8 space-y-3 text-muted">
            {[
              "Comunidade privada: só membros assinantes participam.",
              "Moderação ativa contra spam, ameaças, assédio e exposição de dados pessoais.",
              "Denuncie conteúdos e bloqueie usuários com um toque.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary"># Comunidade Geral</span>
            <DemoBadge />
          </div>
          {[
            { initials: "MB", name: "Membro de exemplo", body: "Exemplo de publicação: é assim que um post aparece na sala.", likes: 12, comments: 4 },
            { initials: "MC", name: "Outro membro", body: "Exemplo de resposta com link compartilhado e imagem opcional.", likes: 5, comments: 1 },
          ].map((p) => (
            <article key={p.name} className="mt-4 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white dark:bg-white/10">
                  {p.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">há alguns minutos</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{p.body}</p>
              <div className="mt-3 flex items-center gap-5 text-sm text-muted" aria-hidden>
                <span className="flex items-center gap-1"><Heart className="size-4" /> {p.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="size-4" /> {p.comments}</span>
                <span className="ml-auto flex items-center gap-1"><Flag className="size-4" /> Denunciar</span>
              </div>
            </article>
          ))}
        </Card>
      </div>
    </section>
  );
}
