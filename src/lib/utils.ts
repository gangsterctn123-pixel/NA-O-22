import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos como moeda brasileira: 499 → "R$ 4,99". */
export function formatBRL(cents: number): string {
  if (!Number.isFinite(cents)) throw new TypeError("valor inválido");
  return brl.format(cents / 100).replace(/ /g, " ");
}

/** Estima o tempo de leitura em minutos (≈200 palavras/min, mínimo 1). */
export function readingMinutes(text: string, wpm = 200): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}
