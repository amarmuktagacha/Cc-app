import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useCcStore } from "@/lib/store";
import appCss from "../styles.css?url";

const APP_NAME = "Cc";

function HydrateStore() {
  useEffect(() => {
    const unsub = useCcStore.persist.onFinishHydration(() => {
      useCcStore.getState().setHydrated(true);
    });
    void useCcStore.persist.rehydrate();
    if (useCcStore.persist.hasHydrated()) {
      useCcStore.getState().setHydrated(true);
    }
    return unsub;
  }, []);
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#09090b" },
      {
        name: "description",
        content: "Cc — system APIs without rooting every app. A rebuilt Shizuku-style manager.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <PreviewHostBridge />
        <HydrateStore />
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <AppShell>
              <Outlet />
            </AppShell>
            <Toaster
              theme="dark"
              position="top-center"
              toastOptions={{
                className:
                  "bg-card text-foreground shadow-[var(--shadow-lift)] border-0 font-sans",
              }}
            />
          </TooltipProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
