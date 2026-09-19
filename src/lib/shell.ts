import type { AuthorizedApp, ServiceStatus, StartMethod } from "./store";

export interface ShellContext {
  status: ServiceStatus;
  method: StartMethod;
  uid: number;
  apps: AuthorizedApp[];
  version: string;
  device: string;
  android: string;
}

export interface ShellResult {
  output: string;
  clear?: boolean;
}

export function runShell(raw: string, ctx: ShellContext): ShellResult {
  const line = raw.trim();
  if (!line) return { output: "" };
  const [cmd, ...args] = line.split(/\s+/);
  const name = (cmd ?? "").toLowerCase();

  if (name === "clear" || name === "cls") return { output: "", clear: true };

  if (name === "help") {
    return {
      output: [
        "rish — restricted shell via Cc",
        "  help                 this list",
        "  id                   current uid/gid",
        "  whoami               account name",
        "  uname -a             kernel",
        "  getprop [key]        system properties",
        "  pm list packages     authorized packages",
        "  dumpsys cc           service dump",
        "  shizuku              alias for dumpsys cc",
        "  date                 device time",
        "  echo [text]",
        "  clear",
      ].join("\n"),
    };
  }

  if (name === "id") {
    if (ctx.uid === 0) {
      return { output: "uid=0(root) gid=0(root) groups=0(root),1004(input),1007(log),2000(shell)" };
    }
    return { output: "uid=2000(shell) gid=2000(shell) groups=2000(shell),1004(input),1007(log),3003(inet)" };
  }

  if (name === "whoami") {
    return { output: ctx.uid === 0 ? "root" : "shell" };
  }

  if (name === "date") {
    return { output: new Date().toString() };
  }

  if (name === "uname") {
    return {
      output:
        "Linux localhost 5.15.137-android14-11 #1 SMP PREEMPT Wed Aug 13 07:12:00 UTC 2024 aarch64 Toybox",
    };
  }

  if (name === "echo") {
    return { output: args.join(" ") };
  }

  if (name === "getprop") {
    const props: Record<string, string> = {
      "ro.build.version.release": ctx.android,
      "ro.build.version.sdk": "34",
      "ro.product.model": ctx.device,
      "ro.product.manufacturer": "Google",
      "ro.debuggable": "1",
      "service.adb.tcp.port": "41927",
      "ro.boot.selinux": "enforcing",
    };
    const key = args[0];
    if (key) return { output: props[key] ?? "" };
    return {
      output: Object.entries(props)
        .map(([k, v]) => `[${k}]: [${v}]`)
        .join("\n"),
    };
  }

  if (name === "pm" && args[0] === "list") {
    if (ctx.status !== "running") {
      return { output: "error: Cc is not running" };
    }
    const lines = ctx.apps
      .filter((a) => a.granted)
      .map((a) => `package:${a.packageName}`);
    return { output: lines.join("\n") || "no granted packages" };
  }

  if (name === "dumpsys" || name === "shizuku") {
    if (ctx.status !== "running") {
      return { output: "Cc: stopped" };
    }
    return {
      output: [
        `Cc Manager ${ctx.version}`,
        `  status: ${ctx.status}`,
        `  method: ${ctx.method ?? "—"}`,
        `  uid: ${ctx.uid}`,
        `  api: 13`,
        `  selinux: Enforcing`,
        `  clients: ${ctx.apps.filter((a) => a.granted).length}`,
      ].join("\n"),
    };
  }

  if (name === "su" || name === "exit") {
    return { output: name === "exit" ? "" : "su: permission given through Cc root starter" };
  }

  return { output: `rish: ${name}: not found` };
}
