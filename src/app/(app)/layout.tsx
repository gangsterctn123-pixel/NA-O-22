import { BottomNav, Sidebar } from "@/components/app/app-nav";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { requireUser } from "@/features/auth/session";

// área logada: sempre renderizada por requisição
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const name = profile?.full_name ?? user.email ?? "";

  return (
    <div className="min-h-dvh bg-white text-black">
      <Sidebar
        footer={
          <div className="border-t border-border pt-4">
            <p className="truncate px-3 text-sm font-semibold">{name}</p>
            {profile?.username && <p className="truncate px-3 text-xs text-[#555555]">@{profile.username}</p>}
            <div className="mt-2">
              <SignOutButton compact />
            </div>
          </div>
        }
      />
      <div className="pb-24 lg:pb-0 lg:pl-64">
        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
