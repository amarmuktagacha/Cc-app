import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { runShell } from "@/lib/shell";
import { t } from "@/lib/i18n";
import { useCcStore } from "@/lib/store";

interface Line {
  id: number;
  kind: "in" | "out";
  text: string;
}

export function Terminal() {
  const lang = useCcStore((s) => s.lang);
  const status = useCcStore((s) => s.status);
  const method = useCcStore((s) => s.method);
  const uid = useCcStore((s) => s.uid);
  const apps = useCcStore((s) => s.apps);
  const version = useCcStore((s) => s.version);
  const device = useCcStore((s) => s.device);
  const android = useCcStore((s) => s.android);
  const addLog = useCcStore((s) => s.addLog);

  const [lines, setLines] = useState<Line[]>([
    { id: 0, kind: "out", text: "rish 13.6.0 — type help" },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hidx, setHidx] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const seq = useRef(1);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const prompt = uid === 0 ? "root@cc #" : "shell@cc $";

  function submit(raw: string) {
    const text = raw.trim();
    if (!text) return;
    const idIn = seq.current++;
    setLines((prev) => [...prev, { id: idIn, kind: "in", text: `${prompt} ${text}` }]);
    setHist((h) => [text, ...h.filter((x) => x !== text)].slice(0, 50));
    setHidx(-1);
    setValue("");
    const result = runShell(text, { status, method, uid, apps, version, device, android });
    if (result.clear) {
      setLines([]);
      return;
    }
    if (result.output) {
      const idOut = seq.current++;
      setLines((prev) => [...prev, { id: idOut, kind: "out", text: result.output }]);
    }
    addLog("debug", `rish: ${text}`);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(hist.length - 1, hidx + 1);
      if (hist[next]) {
        setHidx(next);
        setValue(hist[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hidx - 1;
      if (next < 0) {
        setHidx(-1);
        setValue("");
      } else if (hist[next]) {
        setHidx(next);
        setValue(hist[next]);
      }
    }
  }

  return (
    <section className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">rish</h2>
          <p className="text-xs text-muted-foreground">{t(lang, "shellHint")}</p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{prompt}</span>
      </div>
      <div
        ref={scroller}
        className="h-[min(52vh,420px)] overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
        onClick={() => input.current?.focus()}
      >
        {lines.map((line) => (
          <pre
            key={line.id}
            className={
              line.kind === "in" ? "whitespace-pre-wrap text-live" : "whitespace-pre-wrap text-foreground/90"
            }
          >
            {line.text}
          </pre>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{prompt}</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={t(lang, "shellPlaceholder")}
          className="h-10 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/60"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </section>
  );
}
