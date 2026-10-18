import { z } from "zod";

/** Variáveis públicas (seguras no cliente). Segredos (service role, Stripe) nunca entram aqui. */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEMO_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_DEFAULT_PRICE_CENTS: z.coerce.number().int().positive().default(499),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
});

// Referências literais: o Next.js só embute no bundle variáveis NEXT_PUBLIC_ escritas por extenso.
export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || undefined,
  NEXT_PUBLIC_DEFAULT_PRICE_CENTS: process.env.NEXT_PUBLIC_DEFAULT_PRICE_CENTS || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  // aceita o nome novo do painel ("publishable key") ou o antigo ("anon key")
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
});

export const supabaseConfig =
  publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? { url: publicEnv.NEXT_PUBLIC_SUPABASE_URL, anonKey: publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    : null;

export const isSupabaseConfigured = supabaseConfig !== null;
