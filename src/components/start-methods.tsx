import { useState } from "react";
import { toast } from "sonner";
import { Cable, Shield, Wifi } from "lucide-react";
import { PairingWizard } from "@/components/pairing-wizard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StartMethods() {
  const lang = useCcStore((s) => s.lang);
  const status = useCcStore((s) => s.status);
  const beginStart = useCcStore((s) => s.beginStart);
  const finishStart = useCcStore((s) => s.finishStart);
  const addLog = useCcStore((s) => s.addLog);
  const [wirelessOpen, setWirelessOpen] = useState(false);
  const [usbOpen, setUsbOpen] = useState(false);
  const [rootOpen, setRootOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const busy = status === "starting";

  const usbCmd = t(lang, "usbCommand");

  function simulate(method: "usb" | "root") {
    beginStart(method);
    addLog("debug", method === "root" ? "su: starter.sh" : "adb: waiting for device");
    window.setTimeout(() => {
      finishStart(true);
      toast.success(t(lang, "serviceStartedToast"));
    }, 1100);
  }

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(usbCmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const methods = [
    {
      id: "wireless" as const,
      icon: Wifi,
      title: t(lang, "startWireless"),
      desc: t(lang, "startWirelessDesc"),
      onClick: () => setWirelessOpen(true),
    },
    {
      id: "usb" as const,
      icon: Cable,
      title: t(lang, "startUsb"),
      desc: t(lang, "startUsbDesc"),
      onClick: () => setUsbOpen(true),
    },
    {
      id: "root" as const,
      icon: Shield,
      title: t(lang, "startRoot"),
      desc: t(lang, "startRootDesc"),
      onClick: () => setRootOpen(true),
    },
  ];

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              disabled={busy}
              onClick={m.onClick}
              className={cn(
                "rounded-xl bg-card p-4 text-left shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 ease-out",
                "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <span className="grid size-10 place-items-center rounded-md bg-secondary">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <h3 className="mt-3 text-sm font-medium">{m.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
            </button>
          );
        })}
      </div>

      <PairingWizard open={wirelessOpen} onOpenChange={setWirelessOpen} />

      <Dialog open={usbOpen} onOpenChange={setUsbOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(lang, "usbTitle")}</DialogTitle>
            <DialogDescription>{t(lang, "usbBody")}</DialogDescription>
          </DialogHeader>
          <pre className="overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs leading-relaxed text-foreground">
            {usbCmd}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={copyCmd}>
              {copied ? t(lang, "copied") : t(lang, "copy")}
            </Button>
            <Button
              onClick={() => {
                setUsbOpen(false);
                simulate("usb");
              }}
            >
              {t(lang, "usbStart")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rootOpen} onOpenChange={setRootOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(lang, "confirmRoot")}</DialogTitle>
            <DialogDescription>{t(lang, "confirmRootBody")}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{t(lang, "rootBody")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRootOpen(false)}>
              {t(lang, "deny")}
            </Button>
            <Button
              onClick={() => {
                setRootOpen(false);
                simulate("root");
              }}
            >
              {t(lang, "allow")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
