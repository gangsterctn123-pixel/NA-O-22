import { cn } from "@/lib/utils";

/**
 * Símbolo NAÇÃO 22: losango geométrico estilizado formado por duas lâminas
 * (brancas) sobre base azul, com losango amarelo, sugerindo um "N"
 * e movimento para frente. Original — não reproduz brasão, bandeira ou símbolos partidários.
 */
export function LogoMark({ className, title = "NAÇÃO 22" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-9", className)} role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="48" height="48" rx="12" fill="#0645A8" />
      <path d="M13 34V14l11 10" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 24l11 10V14" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 6l3.2 3.2L24 12.4l-3.2-3.2z" fill="#FFDA00" />
    </svg>
  );
}

export function Logo({ className, showSlogan = false }: { className?: string; showSlogan?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight">
          NAÇÃO <span className="text-primary">22</span>
        </span>
        {showSlogan && <span className="mt-1 text-[10px] font-medium text-muted">Informação, Liberdade e Comunidade.</span>}
      </span>
    </span>
  );
}
