import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo obrigatório em qualquer conteúdo de demonstração — nunca exibir exemplo como notícia real. */
export function DemoBadge({ className, label = "Exemplo demonstrativo" }: { className?: string; label?: string }) {
  return (
    <span
      data-demo
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-gold-500 bg-gold-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-navy-900 dark:text-gold-400",
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  );
}
