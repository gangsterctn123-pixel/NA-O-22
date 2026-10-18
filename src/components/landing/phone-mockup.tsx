import { Bell, BookOpen, Home, Newspaper, Sparkles, User, Users } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { DemoBadge } from "@/components/ui/demo-badge";

/** Demonstração visual do app. Todo o conteúdo é ilustrativo e marcado como tal. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-label="Demonstração da interface do aplicativo">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-green-500/25 via-transparent to-gold-400/25 blur-3xl" />
      <div className="animate-float rounded-[2.75rem] border-[10px] border-navy-900 bg-navy-900 shadow-2xl shadow-navy-900/40 dark:border-navy-800">
        <div className="overflow-hidden rounded-[2rem] bg-mist text-navy-900">
          <div className="flex items-center justify-between bg-navy-900 px-4 pb-3 pt-5 text-white">
            <div className="flex items-center gap-2">
              <LogoMark className="size-7" />
              <span className="text-sm font-bold">Bom dia</span>
            </div>
            <Bell className="size-4 text-gold-400" aria-hidden />
          </div>

          <div className="space-y-3 p-3">
            <div className="rounded-2xl bg-navy-900 p-3 text-white">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gold-400">
                <Sparkles className="size-3" aria-hidden /> Seu Resumo do Dia
              </div>
              <p className="mt-1 text-sm font-bold leading-snug">5 assuntos em 3 minutos</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? "bg-green-400" : "bg-white/20"}`} />
                ))}
              </div>
            </div>

            {["Congresso", "Economia"].map((cat, i) => (
              <div key={cat} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-navy-800 to-navy-700" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-green-600">{cat}</span>
                  <span className="text-[10px] text-slate-500">{i + 3} min</span>
                </div>
                <div className="mt-1.5 h-2.5 w-11/12 rounded bg-slate-200" />
                <div className="mt-1 h-2.5 w-2/3 rounded bg-slate-200" />
              </div>
            ))}
            <div className="flex justify-center">
              <DemoBadge label="Interface ilustrativa" />
            </div>
          </div>

          <div className="grid grid-cols-5 border-t border-slate-200 bg-white px-1 py-2">
            {[Home, Newspaper, Users, BookOpen, User].map((Icon, i) => (
              <div key={i} className="flex justify-center">
                <Icon className={`size-[18px] ${i === 0 ? "text-green-600" : "text-slate-400"}`} aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
