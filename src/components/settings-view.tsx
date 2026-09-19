import type { ReactNode } from "react";
import { toast } from "sonner";
import { LogStream } from "@/components/log-stream";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { t, type Lang } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const lang = useCcStore((s) => s.lang);
  const setLang = useCcStore((s) => s.setLang);
  const startOnBoot = useCcStore((s) => s.startOnBoot);
  const setStartOnBoot = useCcStore((s) => s.setStartOnBoot);
  const watchdog = useCcStore((s) => s.watchdog);
  const setWatchdog = useCcStore((s) => s.setWatchdog);
  const version = useCcStore((s) => s.version);
  const reset = useCcStore((s) => s.reset);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t(lang, "navSettings")}</h1>
      </header>

      <section className="rounded-xl bg-card p-2 shadow-[var(--shadow-border)]">
        <h2 className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t(lang, "settingsGeneral")}
        </h2>
        <Row
          title={t(lang, "startOnBoot")}
          hint={t(lang, "startOnBootHint")}
          control={<Switch checked={startOnBoot} onCheckedChange={setStartOnBoot} />}
        />
        <Row
          title={t(lang, "watchdog")}
          hint={t(lang, "watchdogHint")}
          control={<Switch checked={watchdog} onCheckedChange={setWatchdog} />}
        />
        <Row
          title={t(lang, "language")}
          hint={lang === "bn" ? t(lang, "bangla") : t(lang, "english")}
          control={
            <div className="flex rounded-full bg-secondary p-1">
              {(["bn", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l === "bn" ? t(lang, "bangla") : t(lang, "english")}
                </button>
              ))}
            </div>
          }
        />
      </section>

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="text-base font-medium">{t(lang, "about")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t(lang, "aboutBody")}</p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Cc {version}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t(lang, "footerNote")}</p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => {
            reset();
            toast.success(t(lang, "resetDemo"));
          }}
        >
          {t(lang, "resetDemo")}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t(lang, "resetDemoHint")}</p>
      </section>

      <LogStream />
    </div>
  );
}

function Row({
  title,
  hint,
  control,
}: {
  title: string;
  hint: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
