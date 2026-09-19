import { createFileRoute } from "@tanstack/react-router";
import { AppsPanel } from "@/components/apps-panel";
import { LogStream } from "@/components/log-stream";
import { StartMethods } from "@/components/start-methods";
import { StatusHero } from "@/components/status-hero";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="stagger-in space-y-6">
      <StatusHero />
      <StartMethods />
      <AppsPanel compact />
      <LogStream limit={6} />
    </div>
  );
}