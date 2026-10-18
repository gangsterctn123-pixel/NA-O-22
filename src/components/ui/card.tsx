import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] transition-shadow",
        className,
      )}
      {...props}
    />
  );
}
