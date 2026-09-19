import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lang } from "./i18n";

export type ServiceStatus = "stopped" | "starting" | "running" | "error";
export type StartMethod = "wireless" | "usb" | "root" | null;
export type LogLevel = "info" | "warn" | "error" | "debug";

export interface AuthorizedApp {
  id: string;
  name: string;
  packageName: string;
  granted: boolean;
  requestedAt: number;
  hue: number;
  category: string;
}

export interface LogEntry {
  id: string;
  ts: number;
  level: LogLevel;
  message: string;
}

export const SEED_APPS: AuthorizedApp[] = [
  {
    id: "appops",
    name: "App Ops",
    packageName: "rikka.appops",
    granted: true,
    requestedAt: Date.now() - 86400000 * 4,
    hue: 168,
    category: "permission",
  },
  {
    id: "hail",
    name: "Hail",
    packageName: "com.aistra.hail",
    granted: true,
    requestedAt: Date.now() - 86400000 * 2,
    hue: 32,
    category: "freeze",
  },
  {
    id: "dhizuku",
    name: "Dhizuku",
    packageName: "com.rosan.dhizuku",
    granted: false,
    requestedAt: Date.now() - 3600000 * 6,
    hue: 210,
    category: "owner",
  },
  {
    id: "installerx",
    name: "InstallerX",
    packageName: "com.rosan.installer.x",
    granted: true,
    requestedAt: Date.now() - 86400000,
    hue: 255,
    category: "install",
  },
  {
    id: "geto",
    name: "Geto",
    packageName: "com.android.geto",
    granted: false,
    requestedAt: Date.now() - 3600000 * 18,
    hue: 48,
    category: "config",
  },
  {
    id: "swift",
    name: "Swift Backup",
    packageName: "org.swiftapps.swiftbackup",
    granted: true,
    requestedAt: Date.now() - 86400000 * 8,
    hue: 142,
    category: "backup",
  },
  {
    id: "audire",
    name: "Audire",
    packageName: "com.illusion.shizuku.audire",
    granted: false,
    requestedAt: Date.now() - 3600000 * 2,
    hue: 300,
    category: "media",
  },
  {
    id: "autoio",
    name: "LiT",
    packageName: "com.rosan.dhizuku.server",
    granted: false,
    requestedAt: Date.now() - 3600000 * 30,
    hue: 12,
    category: "system",
  },
];

export const PAIRING = {
  code: "372841",
  ip: "192.168.0.42",
  pairPort: "37123",
  connectPort: "41927",
};

interface CcState {
  hydrated: boolean;
  lang: Lang;
  status: ServiceStatus;
  method: StartMethod;
  startedAt: number | null;
  uid: number;
  api: number;
  version: string;
  selinux: string;
  device: string;
  android: string;
  apps: AuthorizedApp[];
  logs: LogEntry[];
  startOnBoot: boolean;
  watchdog: boolean;
  developerUnlocked: boolean;
  buildTaps: number;
  wirelessEnabled: boolean;
  setHydrated: (v: boolean) => void;
  setLang: (lang: Lang) => void;
  setStartOnBoot: (v: boolean) => void;
  setWatchdog: (v: boolean) => void;
  tapBuild: () => void;
  setWirelessEnabled: (v: boolean) => void;
  addLog: (level: LogLevel, message: string) => void;
  clearLogs: () => void;
  setAppGranted: (id: string, granted: boolean) => void;
  beginStart: (method: Exclude<StartMethod, null>) => void;
  finishStart: (ok: boolean) => void;
  stop: () => void;
  reset: () => void;
}

let logSeq = 0;

const initial = {
  lang: "bn" as Lang,
  status: "stopped" as ServiceStatus,
  method: null as StartMethod,
  startedAt: null as number | null,
  uid: 2000,
  api: 13,
  version: "13.6.0",
  selinux: "Enforcing",
  device: "Pixel 8",
  android: "14",
  apps: SEED_APPS,
  logs: [] as LogEntry[],
  startOnBoot: true,
  watchdog: true,
  developerUnlocked: false,
  buildTaps: 0,
  wirelessEnabled: false,
};

export const useCcStore = create<CcState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initial,
      setHydrated: (v) => set({ hydrated: v }),
      setLang: (lang) => set({ lang }),
      setStartOnBoot: (startOnBoot) => set({ startOnBoot }),
      setWatchdog: (watchdog) => set({ watchdog }),
      tapBuild: () => {
        const taps = Math.min(7, get().buildTaps + 1);
        set({
          buildTaps: taps,
          developerUnlocked: taps >= 7,
        });
      },
      setWirelessEnabled: (wirelessEnabled) => set({ wirelessEnabled }),
      addLog: (level, message) => {
        logSeq += 1;
        const entry: LogEntry = {
          id: `${Date.now()}-${logSeq}`,
          ts: Date.now(),
          level,
          message,
        };
        set({ logs: [entry, ...get().logs].slice(0, 200) });
      },
      clearLogs: () => set({ logs: [] }),
      setAppGranted: (id, granted) => {
        set({
          apps: get().apps.map((a) => (a.id === id ? { ...a, granted } : a)),
        });
        const app = get().apps.find((a) => a.id === id);
        if (app) {
          get().addLog(
            "info",
            granted
              ? `granted ${app.packageName}`
              : `revoked ${app.packageName}`,
          );
        }
      },
      beginStart: (method) => {
        const uid = method === "root" ? 0 : 2000;
        set({ status: "starting", method, uid });
        get().addLog("info", `starter: ${method}`);
      },
      finishStart: (ok) => {
        if (ok) {
          set({ status: "running", startedAt: Date.now() });
          const { uid, method } = get();
          get().addLog(
            "info",
            `server started uid=${uid} method=${method} api=13`,
          );
        } else {
          set({ status: "error", startedAt: null });
          get().addLog("error", "starter failed");
        }
      },
      stop: () => {
        get().addLog("warn", "server stopped");
        set({ status: "stopped", startedAt: null, method: null });
      },
      reset: () => {
        set({
          ...initial,
          apps: SEED_APPS.map((a) => ({ ...a })),
          logs: [],
          hydrated: true,
        });
      },
    }),
    {
      name: "cc-manager-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        lang: s.lang,
        status: s.status,
        method: s.method,
        startedAt: s.startedAt,
        uid: s.uid,
        apps: s.apps,
        logs: s.logs,
        startOnBoot: s.startOnBoot,
        watchdog: s.watchdog,
        developerUnlocked: s.developerUnlocked,
        buildTaps: s.buildTaps,
        wirelessEnabled: s.wirelessEnabled,
      }),
    },
  ),
);
