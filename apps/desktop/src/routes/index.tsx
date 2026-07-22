import { createFileRoute } from "@tanstack/react-router";

import { AppWindow } from "@/components/app-window";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <AppWindow>
      {/* Screens are filled in by the state machine in the next step. */}
      <div className="flex flex-1 items-center justify-center text-fg-3" />
    </AppWindow>
  );
}
