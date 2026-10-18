import { Bell, BookOpen, Landmark, Newspaper, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: Newspaper,
    title: "Feed de notícias",
    text: "Política, Congresso, Economia, Justiça, Segurança, Eleições, Brasil e Mundo — com fonte original em todos os textos.",
  },
  {
    icon: Sparkles,
    title: "Seu Resumo do Dia",
    text: "Os cinco assuntos mais importantes, por que eles importam e links para aprofundar. Revisado pela equipe editorial.",
  },
  {
    icon: Landmark,
    title: "Radar Político",
    text: "Projetos de lei, votações e decisões com número, situação, órgão responsável e link para a fonte oficial.",
  },
  {
    icon: BookOpen,
    title: "Entenda a Notícia",
    text: "Linguagem simples, contexto histórico, termos explicados e diferentes perspectivas — com as limitações da IA à vista.",
  },
  {
    icon: Users,
    title: "Comunidade privada",
    text: "Salas temáticas para debater com membros, com moderação ativa e regras claras de convivência.",
  },
  {
    icon: Bell,
    title: "Notificações sob medida",
    text: "Escolha o que acompanhar: briefing diário, temas do radar, respostas e avisos importantes.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="scroll-mt-20 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Funcionalidades"
          title="Tudo o que você precisa para acompanhar o Brasil"
          description="Informação organizada, verificável e sem ruído. Fato, análise e opinião sempre identificados."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="group p-6 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/5 transition-all duration-300">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-white/10">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
