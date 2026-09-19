import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "@/components/terminal";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";

export const Route = createFileRoute("/shell")({ component: ShellPage });

function ShellPage() {
  const lang = useCcStore((s) => s.lang);
  return (
    <div className="stagger-in space-y-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t(lang, "navShell")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(lang, "shellHint")}</p>
      </header>
      <Terminal />
    </div>
  );
}
