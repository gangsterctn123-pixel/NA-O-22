import type { Metadata } from "next";
import { DraftNotice, SimplePage } from "@/components/layout/simple-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return (
    <SimplePage title="Termos de uso">
      <DraftNotice />
      <h2>1. Sobre a plataforma</h2>
      <p>{site.independenceNotice}</p>
      <h2>2. Conta e acesso</h2>
      <p>Para usar recursos de membro, você precisa criar uma conta com dados verdadeiros e manter sua senha em sigilo. Visitantes têm acesso apenas às áreas públicas.</p>
      <h2>3. Assinatura</h2>
      <ul>
        <li>A assinatura é mensal, com renovação automática, até que seja cancelada.</li>
        <li>O cancelamento pode ser feito a qualquer momento na área da conta e vale ao fim do período pago.</li>
        <li>Alterações de preço serão comunicadas com antecedência e valem a partir do ciclo seguinte.</li>
      </ul>
      <h2>4. Conteúdos especiais</h2>
      <p>Conteúdos adquiridos individualmente ficam disponíveis na biblioteca do comprador enquanto a conta estiver ativa e a plataforma em operação, para uso pessoal e intransferível.</p>
      <h2>5. Conteúdo e inteligência artificial</h2>
      <p>Resumos e explicações podem ser produzidos com auxílio de IA e passam por revisão editorial. Sempre indicamos as fontes originais. Fatos, análises e opiniões são identificados separadamente.</p>
      <h2>6. Conduta na comunidade</h2>
      <p>É proibido publicar ameaças, assédio, discurso de ódio, spam ou dados pessoais de terceiros. Violações podem resultar em remoção de conteúdo, suspensão ou encerramento da conta. Veja as Regras da comunidade.</p>
      <h2>7. Contato</h2>
      <p>Dúvidas: {site.supportEmail}</p>
    </SimplePage>
  );
}
