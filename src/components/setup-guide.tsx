import { Cable, Layers, Shield, Wifi } from "lucide-react";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";

export function SetupGuide() {
  const lang = useCcStore((s) => s.lang);

  const steps = [
    { icon: Wifi, title: t(lang, "startWireless"), body: t(lang, "startWirelessDesc") },
    { icon: Cable, title: t(lang, "startUsb"), body: t(lang, "startUsbDesc") },
    { icon: Shield, title: t(lang, "startRoot"), body: t(lang, "startRootDesc") },
  ];

  const how = [t(lang, "how1"), t(lang, "how2"), t(lang, "how3")];

  return (
    <div className="space-y-6">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t(lang, "setupTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(lang, "setupLead")}</p>
      </header>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="text-base font-medium">{t(lang, "howItWorks")}</h2>
        <ol className="mt-4 space-y-4">
          {how.map((text, i) => (
            <li key={text} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.title} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <span className="grid size-10 place-items-center rounded-md bg-secondary">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <h3 className="mt-3 text-sm font-medium">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-secondary">
            <Layers className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-medium">{t(lang, "whyTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t(lang, "whyBody")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
