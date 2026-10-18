import { site } from "@/lib/config/site";

/**
 * Preço da assinatura em centavos.
 * Fase 1: valor de ambiente. Fase 2+: lê app_settings('public.subscription') no Supabase,
 * com fallback para o valor de ambiente caso o banco esteja indisponível.
 */
export async function getSubscriptionPriceCents(): Promise<number> {
  return site.priceCents;
}
