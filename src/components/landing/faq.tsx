import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatBRL } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

export function getFaq(priceCents: number) {
  return [
    {
      q: "A NAÇÃO 22 tem ligação com algum partido ou candidato?",
      a: "Não. A NAÇÃO 22 é uma plataforma independente e não possui vínculo oficial com partidos, candidatos, governos ou organizações políticas.",
    },
    {
      q: "De onde vêm as notícias?",
      a: "De fontes públicas e autorizadas, como agências oficiais, feeds RSS e APIs de dados abertos. Toda notícia exibe a fonte original com link, e nenhum conteúdo é publicado sem revisão da equipe editorial.",
    },
    {
      q: "Como a inteligência artificial é usada?",
      a: "A IA ajuda a resumir, classificar e explicar notícias. Ela não inventa declarações nem fatos, informa suas limitações e não publica nada automaticamente: um editor revisa e aprova cada conteúdo.",
    },
    {
      q: "Quanto custa e como cancelo?",
      a: `A assinatura custa ${formatBRL(priceCents)} por mês, com renovação automática. Você pode cancelar a qualquer momento na sua conta, e o acesso continua até o fim do período já pago.`,
    },
    {
      q: "Posso usar no celular?",
      a: "Sim. A NAÇÃO 22 funciona como aplicativo: você pode instalá-la na tela inicial do iPhone ou Android direto pelo navegador, sem loja de aplicativos.",
    },
    {
      q: "Como meus dados são tratados?",
      a: "Seguimos a LGPD: coletamos apenas o necessário, não vendemos dados, seu perfil e sua participação na comunidade não são públicos, e você pode exportar ou excluir sua conta quando quiser.",
    },
  ];
}

export function Faq({ priceCents }: { priceCents: number }) {
  return (
    <section id="faq" className="scroll-mt-20 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Perguntas frequentes" title="Tire suas dúvidas" />
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
          {getFaq(priceCents).map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="last:border-b-0">
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
