import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="text-3xl font-extrabold">Página não encontrada</h1>
      <p className="text-muted">O endereço pode ter mudado ou o conteúdo foi removido.</p>
      <Button asChild><Link href="/">Voltar ao início</Link></Button>
    </main>
  );
}
