import { createFileRoute } from "@tanstack/react-router";
import { SetupGuide } from "@/components/setup-guide";

export const Route = createFileRoute("/setup")({ component: SetupPage });

function SetupPage() {
  return (
    <div className="stagger-in">
      <SetupGuide />
    </div>
  );
}
