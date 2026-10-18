import { Bell, BookOpen, Home, Newspaper, Sparkles, User, Users } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { DemoBadge } from "@/components/ui/demo-badge";

/** Demonstração visual do app. Todo o conteúdo é ilustrativo e marcado como tal. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-label="Demonstração da interface do aplicativo">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-brand-blue/15 via-transparent to-gold-400/25 blur-3xl" />
      <div className="animate-float rounded-[2.75rem] border-[10px] border-black bg-black shadow-2xl shadow-black/25">
        <div className="overflow-hidden rounded-[2rem] bg-white text-black">
          <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 pb-3 pt-5 text-black">
            <div className="flex items-center gap-2">
              <LogoMark className="size-7" />
              <span className="text-sm font-bold">Bom dia</span>
            </div>
            <Bell className="size-4 text-brand-blue" aria-hidden />
          </div>

          <div className="space-y-3 p-3">
            <div className="rounded-2xl border border-black/10 bg-white p-3 text-black">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-blue">
                <Sparkles className="size-3" aria-hidden /> Seu Resumo do Dia
              </div>
              <p className="mt-1 text-sm font-bold leading-snug">5 assuntos em 3 minutos</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-gold-400" : "bg-black/10"}`} />
                ))}
              </div>
            </div>

            {["Congresso", "Economia"].map((cat, i) => (
              <div key={cat} className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-brand-blue/15 to-gold-400/25" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-blue">{cat}</span>
                  <span className="text-[10px] text-[#555555]">{i + 3} min</span>
                </div>
                <div className="mt-1.5 h-2.5 w-11/12 rounded bg-black/10" />
                <div className="mt-1 h-2.5 w-2/3 rounded bg-black/10" />
              </div>
            ))}
            <div className="flex justify-center">
              <DemoBadge label="Interface ilustrativa" />
            </div>
          </div>

          <div className="grid grid-cols-5 border-t border-black/10 bg-white px-1 py-2">
            {[Home, Newspaper, Users, BookOpen, User].map((Icon, i) => (
              <div key={i} className="flex justify-center">
                <Icon className={`size-[18px] ${i === 0 ? "text-brand-blue" : "text-[#555555]"}`} aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
