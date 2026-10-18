"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Newspaper, User, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export const appNav = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/comunidade", label: "Comunidade", icon: Users },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/perfil", label: "Perfil", icon: User },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegação inferior fixa (mobile). */
export function BottomNav() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Navegação principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {appNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 pt-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-brand-blue" : "text-[#555555]",
                )}
              >
                <span className={cn("rounded-full px-4 py-1 transition-colors", active && "bg-brand-blue/10")}>
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar lateral (desktop). */
export function Sidebar({ footer }: { footer?: React.ReactNode }) {
  const isActive = useIsActive();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white px-4 py-6 lg:flex">
      <Link href="/inicio" className="px-2" aria-label="NAÇÃO 22 — início">
        <Logo />
      </Link>
      <nav aria-label="Navegação principal" className="mt-8 flex-1">
        <ul className="space-y-1">
          {appNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors",
                    active ? "bg-brand-blue/10 text-brand-blue" : "text-black hover:bg-[#f5f5f5]",
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-brand-blue" : "text-[#555555]")} aria-hidden />
                  {label}
                  {active && <span className="ml-auto size-1.5 rounded-full bg-gold-400" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer}
    </aside>
  );
}
