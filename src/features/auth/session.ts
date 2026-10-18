import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  role: "member" | "admin";
  created_at: string;
};

/**
 * Exige usuário logado (2ª barreira, além do proxy.ts). Cacheado por requisição.
 * O perfil pode ser null se a migration ainda não foi aplicada.
 */
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, bio, role, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile };
});
