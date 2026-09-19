import { createFileRoute } from "@tanstack/react-router";
import { AppsPanel } from "@/components/apps-panel";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";

export const Route = createFileRoute("/apps")({ component: AppsPage });

function AppsPage() {
  const lang = useCcStore((s) => s.lang);
  return (
    <div className="stagger-in space-y-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t(lang, "authorizedApps")}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t(lang, "authorizedHint")}</p>
      </header>
      <AppsPanel />
    </div>
  );
}
