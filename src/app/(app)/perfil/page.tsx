import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = { title: "Perfil" };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  const name = profile?.full_name ?? "";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-black">Perfil</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xl font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-black" data-testid="profile-name">{name || "Membro"}</p>
            {profile?.username && <p className="truncate text-[#555555]">@{profile.username}</p>}
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#555555]">E-mail</dt>
            <dd className="font-semibold text-black break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-[#555555]">Membro desde</dt>
            <dd className="font-semibold text-black">{dateFmt.format(new Date(profile?.created_at ?? user.created_at))}</dd>
          </div>
        </dl>
        {!profile && (
          <p className="mt-4 text-sm text-red-700">
            Perfil não encontrado. Verifique se as migrations do banco foram aplicadas.
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/redefinir-senha">
            <KeyRound aria-hidden /> Alterar senha
          </Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}
