import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-white px-4 text-base text-black placeholder:text-[#8a8a8a] transition-colors",
        "focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20",
        "aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-600/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
