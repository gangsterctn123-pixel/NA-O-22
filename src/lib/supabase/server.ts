import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/config/env";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Usa a chave pública (anon/publishable) + cookies da sessão; as permissões vêm do RLS.
 */
export async function createSupabaseServerClient() {
  // ler cookies antes marca a rota como dinâmica (nunca pré-renderizar dados de sessão)
  const cookieStore = await cookies();
  if (!supabaseConfig) throw new SupabaseNotConfiguredError();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components não podem gravar cookies; o proxy.ts renova a sessão.
        }
      },
    },
  });
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}

/** Usuário autenticado (validado no servidor do Supabase) ou null. */
export async function getCurrentUser() {
  if (!supabaseConfig) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
