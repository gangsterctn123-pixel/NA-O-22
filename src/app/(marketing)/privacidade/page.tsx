import type { Metadata } from "next";
import { DraftNotice, SimplePage } from "@/components/layout/simple-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  return (
    <SimplePage title="Política de privacidade">
      <DraftNotice />
      <p>Esta política descreve como a {site.name} trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>
      <h2>Dados que coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada pelo provedor de autenticação).</li>
        <li><strong>Perfil (opcional):</strong> foto e biografia.</li>
        <li><strong>Assinatura:</strong> status e histórico de pagamentos. Dados de cartão são processados pela Stripe e não ficam conosco.</li>
        <li><strong>Uso:</strong> conteúdos salvos, temas acompanhados, publicações na comunidade e preferências de notificação.</li>
      </ul>
      <h2>Dados sensíveis</h2>
      <p>Interesses e opiniões políticas podem ser considerados dados sensíveis. Por isso, seu perfil e sua atividade na comunidade não são públicos e ficam visíveis apenas para membros da comunidade privada.</p>
      <h2>Finalidades</h2>
      <p>Prestar o serviço, gerenciar a assinatura, enviar notificações que você autorizou, moderar a comunidade, prevenir fraudes e cumprir obrigações legais. Não vendemos dados pessoais.</p>
      <h2>Seus direitos</h2>
      <p>Você pode acessar, corrigir, exportar e excluir seus dados, além de revogar consentimentos, diretamente na sua conta ou pelo e-mail {site.supportEmail}.</p>
      <h2>Retenção</h2>
      <p>Mantemos dados apenas pelo tempo necessário às finalidades acima ou exigido por lei (por exemplo, registros fiscais de pagamentos).</p>
    </SimplePage>
  );
}
