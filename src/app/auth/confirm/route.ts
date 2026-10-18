import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/features/auth/routes";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Destino dos links enviados por e-mail (confirmação de cadastro e recuperação de senha).
 * Suporta os dois formatos do Supabase:
 *  - ?code=...                 (fluxo PKCE, template padrão {{ .ConfirmationURL }})
 *  - ?token_hash=...&type=...  (template personalizado; funciona em outro dispositivo)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const fail = (reason: string) => NextResponse.redirect(new URL(`/entrar?erro=${reason}`, origin));

  if (!isSupabaseConfigured) return fail("indisponivel");

  // erro devolvido pelo próprio Supabase (ex.: link expirado)
  if (searchParams.get("error")) return fail("link");

  const supabase = await createSupabaseServerClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link");
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail("link");
  } else {
    return fail("link");
  }

  const destination = type === "recovery" ? "/redefinir-senha" : next;
  return NextResponse.redirect(new URL(destination, origin));
}
