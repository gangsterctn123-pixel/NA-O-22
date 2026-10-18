/** Rotas que exigem login. Qualquer subcaminho também é protegido. */
export const PROTECTED_PREFIXES = ["/inicio", "/noticias", "/comunidade", "/biblioteca", "/perfil", "/admin", "/redefinir-senha"];

/** Páginas que não fazem sentido para quem já está logado. */
export const GUEST_ONLY_PATHS = ["/entrar", "/cadastro"];

export const AFTER_LOGIN_PATH = "/inicio";

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Aceita apenas caminhos internos como destino pós-login (evita open redirect:
 * "//evil.com", "https://evil.com", "/\\evil.com").
 */
export function safeNextPath(next: string | null | undefined, fallback = AFTER_LOGIN_PATH) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  try {
    const url = new URL(next, "http://local");
    if (url.origin !== "http://local") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
