import type { Metadata } from "next";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata: Metadata = { title: "Regras da comunidade" };

export default function RulesPage() {
  return (
    <SimplePage title="Regras da comunidade">
      <p>A Comunidade NAÇÃO 22 é um espaço de debate entre membros. Para mantê-lo saudável:</p>
      <ul>
        <li>Debata ideias, não ataque pessoas.</li>
        <li>Não publique ameaças, assédio, discurso de ódio ou incitação à violência.</li>
        <li>Não divulgue dados pessoais de ninguém (endereço, telefone, documentos, fotos privadas).</li>
        <li>Compartilhe links de fontes e diga quando algo é opinião.</li>
        <li>Nada de spam, correntes, golpes ou propaganda comercial não autorizada.</li>
        <li>Use o botão “Denunciar” em vez de responder a provocações.</li>
      </ul>
      <p>Moderadores podem ocultar ou remover conteúdos e suspender contas que violem estas regras.</p>
    </SimplePage>
  );
}
