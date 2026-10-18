"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatBRL } from "@/lib/utils";

/** Barra fixa inferior visível apenas no mobile, após rolar além do hero. */
export function MobileStickyCta({ priceCents }: { priceCents: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-testid="mobile-sticky-cta"
      aria-hidden={!visible}
      className={cn(
        "pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 leading-tight">
          <p className="text-sm font-bold">{formatBRL(priceCents)}/mês</p>
          <p className="text-xs text-muted">Cancele quando quiser</p>
        </div>
        <Button asChild tabIndex={visible ? 0 : -1}>
          <Link href="/cadastro">Acessar agora</Link>
        </Button>
      </div>
    </div>
  );
}
