import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";
import { cn, formatRelative } from "@/lib/utils";

type Filter = "all" | "granted" | "pending";

export function AppsPanel({ compact = false }: { compact?: boolean }) {
  const lang = useCcStore((s) => s.lang);
  const apps = useCcStore((s) => s.apps);
  const setGranted = useCcStore((s) => s.setAppGranted);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter === "granted" && !a.granted) return false;
      if (filter === "pending" && a.granted) return false;
      if (!query) return true;
      return a.name.toLowerCase().includes(query) || a.packageName.toLowerCase().includes(query);
    });
  }, [apps, filter, q]);

  const visible = compact ? list.slice(0, 4) : list;

  return (
    <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium tracking-tight">{t(lang, "authorizedApps")}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(lang, "authorizedHint")}</p>
        </div>
        {compact ? (
          <Button asChild variant="ghost" size="sm">
            <Link to="/apps">{t(lang, "viewAll")}</Link>
          </Button>
        ) : (
          <div className="flex rounded-full bg-secondary p-1">
            {(["all", "granted", "pending"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "h-8 rounded-full px-3 text-xs font-medium transition-[background-color,color] duration-150",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? t(lang, "allFilter") : f === "granted" ? t(lang, "grantedFilter") : t(lang, "pendingFilter")}
              </button>
            ))}
          </div>
        )}
      </div>

      {!compact ? (
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(lang, "searchApps")}
            className="pl-9"
          />
        </div>
      ) : null}

      <ul className="mt-3 divide-y divide-border">
        {visible.map((app) => (
          <li key={app.id} className="flex items-center gap-3 py-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-md text-sm font-semibold text-background"
              style={{ background: `hsl(${app.hue} 28% 62%)` }}
            >
              {app.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{app.name}</p>
                <Badge variant={app.granted ? "live" : "default"}>
                  {app.granted ? t(lang, "granted") : t(lang, "requested")}
                </Badge>
              </div>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{app.packageName}</p>
            </div>
            <div className="hidden text-xs tabular-nums text-muted-foreground sm:block">
              {formatRelative(app.requestedAt)}
            </div>
            <Button
              size="sm"
              variant={app.granted ? "secondary" : "default"}
              onClick={() => {
                setGranted(app.id, !app.granted);
                toast.success(app.granted ? t(lang, "revokeToast") : t(lang, "grantToast"));
              }}
            >
              {app.granted ? t(lang, "revoke") : t(lang, "grant")}
            </Button>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {q ? t(lang, "emptySearch") : t(lang, "noApps")}
        </p>
      ) : null}
    </section>
  );
}
