import type { Metadata } from "next";
import { SimplePage } from "@/components/layout/simple-page";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Suporte" };

export default function SupportPage() {
  return (
    <SimplePage title="Suporte">
      <p>Precisa de ajuda com sua conta, assinatura ou algum conteúdo? Fale com a equipe:</p>
      <p>
        <a className="font-semibold text-primary hover:underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
      <p>Para correções em notícias, informe o link da página e a fonte que fundamenta a correção.</p>
    </SimplePage>
  );
}
