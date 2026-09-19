import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LogStream({ limit }: { limit?: number }) {
  const lang = useCcStore((s) => s.lang);
  const logs = useCcStore((s) => s.logs);
  const clearLogs = useCcStore((s) => s.clearLogs);
  const rows = limit ? logs.slice(0, limit) : logs;

  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-medium tracking-tight">{t(lang, "logs")}</h2>
        {logs.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clearLogs}>
            {t(lang, "clearLogs")}
          </Button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t(lang, "noLogs")}</p>
      ) : (
        <ul className="mt-3 space-y-1.5 font-mono text-xs">
          {rows.map((log) => (
            <li key={log.id} className="flex gap-2 rounded-sm bg-secondary/50 px-2.5 py-1.5">
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {new Date(log.ts).toLocaleTimeString([], { hour12: false })}
              </span>
              <Badge
                variant={log.level === "error" ? "stop" : log.level === "warn" ? "warn" : "default"}
                className="h-5 shrink-0 px-1.5"
              >
                {log.level}
              </Badge>
              <span
                className={cn(
                  "min-w-0 break-all",
                  log.level === "error" ? "text-destructive" : "text-foreground",
                )}
              >
                {log.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
