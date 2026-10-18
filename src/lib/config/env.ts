import { z } from "zod";

/** Variáveis públicas (seguras no cliente). Variáveis secretas ficam em env.server.ts. */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEMO_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_DEFAULT_PRICE_CENTS: z.coerce.number().int().positive().default(499),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || undefined,
  NEXT_PUBLIC_DEFAULT_PRICE_CENTS: process.env.NEXT_PUBLIC_DEFAULT_PRICE_CENTS || undefined,
});
