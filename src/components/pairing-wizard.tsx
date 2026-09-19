import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, Smartphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n";
import { PAIRING, useCcStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4;

export function PairingWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const lang = useCcStore((s) => s.lang);
  const taps = useCcStore((s) => s.buildTaps);
  const unlocked = useCcStore((s) => s.developerUnlocked);
  const wireless = useCcStore((s) => s.wirelessEnabled);
  const tapBuild = useCcStore((s) => s.tapBuild);
  const setWireless = useCcStore((s) => s.setWirelessEnabled);
  const beginStart = useCcStore((s) => s.beginStart);
  const finishStart = useCcStore((s) => s.finishStart);
  const addLog = useCcStore((s) => s.addLog);

  const [step, setStep] = useState<Step>(0);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [shake, setShake] = useState(false);
  const [ip, setIp] = useState(PAIRING.ip);
  const [cport, setCport] = useState(PAIRING.connectPort);
  const [phase, setPhase] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    setStep(unlocked ? (wireless ? 2 : 1) : 0);
    setCode(["", "", "", "", "", ""]);
    setShake(false);
    setPhase(0);
  }, [open, unlocked, wireless]);

  const entered = code.join("");
  const steps = [t(lang, "stepDev"), t(lang, "stepWireless"), t(lang, "stepPair"), t(lang, "stepConnect")];

  function onDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setCode(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  function submitCode() {
    if (entered !== PAIRING.code) {
      setShake(true);
      window.setTimeout(() => setShake(false), 350);
      return;
    }
    addLog("info", `pairing ok ${PAIRING.ip}:${PAIRING.pairPort}`);
    setStep(3);
  }

  function connect() {
    setStep(4);
    beginStart("wireless");
    const labels = [0, 1, 2];
    labels.forEach((i) => {
      window.setTimeout(() => setPhase(i + 1), 420 * (i + 1));
    });
    window.setTimeout(() => {
      finishStart(true);
      toast.success(t(lang, "serviceStartedToast"));
      onOpenChange(false);
    }, 1700);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t(lang, "pairingTitle")}</DialogTitle>
          <DialogDescription>{t(lang, "pairingLead")}</DialogDescription>
        </DialogHeader>

        {step < 4 ? (
          <ol className="grid grid-cols-4 gap-2">
            {steps.map((label, i) => (
              <li key={label} className="min-w-0">
                <div
                  className={cn(
                    "h-1 rounded-full transition-[background-color] duration-200",
                    i <= step ? "bg-primary" : "bg-secondary",
                  )}
                />
                <p
                  className={cn(
                    "mt-2 truncate text-[10px] font-medium uppercase tracking-wider",
                    i <= step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
              </li>
            ))}
          </ol>
        ) : null}

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(lang, "tapToUnlock")}</p>
              <button
                type="button"
                onClick={tapBuild}
                className="mt-4 flex w-full items-center justify-between rounded-lg bg-secondary px-4 py-3 text-left shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 active:scale-[0.98]"
              >
                <span>
                  <span className="block text-sm font-medium">{t(lang, "buildNumber")}</span>
                  <span className="text-xs text-muted-foreground">AP2A.240905.003</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {Math.max(0, 7 - taps)} {t(lang, "tapsLeft")}
                </span>
              </button>
              {unlocked ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-live">
                  <Check className="size-4" />
                  {t(lang, "developerOn")}
                </p>
              ) : null}
            </div>
            <PhoneFrame>
              <PhoneRow label={t(lang, "buildNumber")} value="AP2A.240905.003" />
              <p className="px-3 pt-4 text-[10px] text-muted-foreground">{t(lang, "tapToUnlock")}</p>
            </PhoneFrame>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(lang, "wirelessOnHint")}</p>
              <label className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Wifi className="size-4" />
                  {t(lang, "startWireless")}
                </span>
                <Switch checked={wireless} onCheckedChange={setWireless} />
              </label>
            </div>
            <PhoneFrame>
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-[11px] font-medium">{t(lang, "startWireless")}</span>
                <span
                  className={cn(
                    "h-4 w-7 rounded-full",
                    wireless ? "bg-live" : "bg-muted-foreground/30",
                  )}
                />
              </div>
              <p className="px-3 text-[10px] leading-relaxed text-muted-foreground">
                {PAIRING.ip}:{PAIRING.connectPort}
              </p>
            </PhoneFrame>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-5 md:grid-cols-[1fr_200px]">
            <div>
              <p className="text-sm text-muted-foreground">{t(lang, "pairingCodeHint")}</p>
              <div className={cn("mt-4 flex gap-2", shake && "shake")} onPaste={onPaste}>
                {code.map((d, i) => (
                  <Input
                    key={i}
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    className="h-12 w-10 px-0 text-center font-mono text-lg tabular-nums"
                    aria-label={`${t(lang, "pairingCode")} ${i + 1}`}
                  />
                ))}
              </div>
              {shake ? <p className="mt-2 text-xs text-destructive">{t(lang, "wrongCode")}</p> : null}
            </div>
            <PhoneFrame>
              <p className="px-3 pt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t(lang, "pairDevice")}
              </p>
              <p className="px-3 pt-2 font-mono text-xl tracking-[0.28em] text-foreground tabular-nums">
                {PAIRING.code.slice(0, 3)} {PAIRING.code.slice(3)}
              </p>
              <p className="px-3 pt-2 text-[10px] text-muted-foreground">
                {PAIRING.ip}:{PAIRING.pairPort}
              </p>
            </PhoneFrame>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {t(lang, "ipAddress")}
              <Input value={ip} onChange={(e) => setIp(e.target.value)} className="font-mono" />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {t(lang, "connectPort")}
              <Input value={cport} onChange={(e) => setCport(e.target.value)} className="font-mono" />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 py-2">
            {[t(lang, "lookingDevice"), t(lang, "handshake"), t(lang, "binderReady")].map((label, i) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-[11px]",
                    phase > i ? "bg-live text-live-fg" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {phase > i ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={phase > i ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {step < 4 ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={() => {
                if (step === 0) onOpenChange(false);
                else setStep((s) => (s - 1) as Step);
              }}
            >
              <ChevronLeft className="size-4" />
              {t(lang, "back")}
            </Button>
            {step === 0 ? (
              <Button onClick={() => setStep(1)} disabled={!unlocked}>
                {t(lang, "continue")}
              </Button>
            ) : null}
            {step === 1 ? (
              <Button onClick={() => setStep(2)} disabled={!wireless}>
                {t(lang, "pairNow")}
              </Button>
            ) : null}
            {step === 2 ? (
              <Button onClick={submitCode} disabled={entered.length !== 6}>
                {t(lang, "continue")}
              </Button>
            ) : null}
            {step === 3 ? (
              <Button onClick={connect} disabled={!ip || !cport}>
                {t(lang, "connect")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PhoneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <span className="text-[11px] font-medium">{label}</span>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[180px] rounded-[28px] bg-secondary p-2 shadow-[var(--shadow-lift)]">
      <div className="overflow-hidden rounded-[20px] bg-card">
        <div className="flex items-center justify-between px-3 py-2 text-[9px] text-muted-foreground">
          <span className="tabular-nums">9:41</span>
          <Smartphone className="size-3" />
        </div>
        {children}
        <div className="h-4" />
      </div>
    </div>
  );
}
