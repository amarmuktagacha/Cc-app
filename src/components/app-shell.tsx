import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AppWindow, BookOpen, House, Settings, Terminal } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useCcStore } from "@/lib/store";
import { t, type CopyKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV: { to: string; key: CopyKey; icon: typeof House }[] = [
  { to: "/", key: "navHome", icon: House },
  { to: "/apps", key: "navApps", icon: AppWindow },
  { to: "/setup", key: "navSetup", icon: BookOpen },
  { to: "/shell", key: "navShell", icon: Terminal },
  { to: "/settings", key: "navSettings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const lang = useCcStore((s) => s.lang);
  const status = useCcStore((s) => s.status);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border/80 bg-background/80 px-3 py-5 md:flex">
        <div className="px-2 pb-6">
          <Logo />
          <p className="mt-2 px-0.5 text-xs leading-relaxed text-muted-foreground">{t(lang, "tagline")}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-[background-color,color] duration-150",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {t(lang, item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "size-1.5 rounded-full",
                status === "running" ? "live-dot bg-live" : "bg-muted-foreground/50",
              )}
            />
            <span className="text-muted-foreground">
              {status === "running" ? t(lang, "statusRunning") : t(lang, "statusStopped")}
            </span>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Logo />
        <Button asChild variant="ghost" size="sm">
          <Link to="/settings">{t(lang, "navSettings")}</Link>
        </Button>
      </header>

      <main className="relative md:pl-56">
        <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/90 backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors duration-150",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2 : 1.6} />
                  {t(lang, item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
