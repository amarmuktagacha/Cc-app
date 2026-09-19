import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";
import { cn, formatUptime } from "@/lib/utils";

export function StatusHero() {
  const lang = useCcStore((s) => s.lang);
  const status = useCcStore((s) => s.status);
  const uid = useCcStore((s) => s.uid);
  const api = useCcStore((s) => s.api);
  const version = useCcStore((s) => s.version);
  const method = useCcStore((s) => s.method);
  const startedAt = useCcStore((s) => s.startedAt);
  const device = useCcStore((s) => s.device);
  const android = useCcStore((s) => s.android);
  const stop = useCcStore((s) => s.stop);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "running" || !startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [status, startedAt]);

  const running = status === "running";
  const starting = status === "starting";

  return (
    <section className="relative overflow-hidden rounded-xl bg-card p-5 shadow-[var(--shadow-border)] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={running ? "live" : starting ? "warn" : status === "error" ? "stop" : "default"}>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  running ? "live-dot bg-live" : starting ? "bg-warn" : "bg-current",
                )}
              />
              {running
                ? t(lang, "statusRunning")
                : starting
                  ? t(lang, "statusStarting")
                  : status === "error"
                    ? t(lang, "statusError")
                    : t(lang, "statusStopped")}
            </Badge>
            <span className="text-xs text-muted-foreground">v{version}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
            Cc
          </h1>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{t(lang, "tagline")}</p>
        </div>
        {running ? (
          <Button variant="destructive" onClick={stop}>
            <Square className="size-3.5 fill-current" />
            {t(lang, "stopService")}
          </Button>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t(lang, "uid")} value={String(uid)} hint={uid === 0 ? t(lang, "rootUser") : t(lang, "shellUser")} />
        <Stat label={t(lang, "api")} value={String(api)} />
        <Stat
          label={t(lang, "uptime")}
          value={running && startedAt ? formatUptime(now - startedAt) : "00:00:00"}
          mono
        />
        <Stat label={t(lang, "selinux")} value={t(lang, "enforcing")} />
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {t(lang, "device")} · {device}
        </span>
        <span>
          {t(lang, "android")} {android}
        </span>
        <span className="capitalize">{method ?? "—"}</span>
        <Link to="/setup" className="text-foreground underline-offset-4 hover:underline">
          {t(lang, "learnMore")}
        </Link>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-secondary/70 px-3 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-lg font-medium tracking-tight", mono && "font-mono tabular-nums")}>
        {value}
        {hint ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </dd>
    </div>
  );
}
