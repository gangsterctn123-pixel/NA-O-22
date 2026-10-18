import { publicEnv } from "./env";

export const site = {
  name: "NAÇÃO 22",
  shortName: "Nação 22",
  slogan: "Informação, Liberdade e Comunidade.",
  description:
    "Notícias políticas, resumos diários, radar do Congresso e uma comunidade privada para quem acompanha a política brasileira.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  demoMode: publicEnv.NEXT_PUBLIC_DEMO_MODE,
  /** Valor padrão; o oficial vem de app_settings ('public.subscription') a partir da Fase 2. */
  priceCents: publicEnv.NEXT_PUBLIC_DEFAULT_PRICE_CENTS,
  supportEmail: "suporte@nacao22.com.br",
  independenceNotice:
    "A NAÇÃO 22 é uma plataforma independente. Não possui vínculo oficial com partidos políticos, candidatos, governos ou organizações políticas.",
} as const;

export const newsCategories = [
  "Política",
  "Congresso",
  "Economia",
  "Justiça",
  "Segurança Pública",
  "Eleições",
  "Brasil",
  "Mundo",
] as const;

export const communityRooms = [
  "Comunidade Geral",
  "Notícias do Dia",
  "Economia e Trabalho",
  "Segurança Pública",
  "Política Nacional",
  "Eleições",
  "História e Conservadorismo",
  "Sugestões e Debates",
] as const;
