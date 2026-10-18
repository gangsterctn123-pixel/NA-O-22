import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { AFTER_LOGIN_PATH, GUEST_ONLY_PATHS, isProtectedPath } from "@/features/auth/routes";

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withCookies(NextResponse.redirect(url), response);
  }

  if (isAuthenticated && GUEST_ONLY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AFTER_LOGIN_PATH;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

/** Preserva cookies de sessão renovados ao redirecionar. */
function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((c) => target.cookies.set(c));
  return target;
}

export const config = {
  // tudo, exceto arquivos estáticos, imagens e metadados do PWA
  matcher: ["/((?!_next/static|_next/image|icons/|icon.svg|apple-icon.png|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)"],
};
