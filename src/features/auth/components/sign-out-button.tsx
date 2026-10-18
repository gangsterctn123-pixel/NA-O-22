import { LogOut } from "lucide-react";
import { signOutAction } from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant={compact ? "ghost" : "outline"} className={cn(compact && "w-full justify-start text-[#555555]", className)}>
        <LogOut aria-hidden /> Sair
      </Button>
    </form>
  );
}
