import { createFileRoute } from "@tanstack/react-router";

import { AppWindow } from "@/components/app-window";
import { AppStoreProvider, useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function Screens() {
  const { screen } = useApp();

  // Screen components are added in the following steps; placeholders keep the
  // state machine runnable in the meantime.
  return (
    <AppWindow>
      <div className="flex flex-1 items-center justify-center text-fg-3">
        {screen}
      </div>
    </AppWindow>
  );
}

function HomePage() {
  return (
    <AppStoreProvider>
      <Screens />
    </AppStoreProvider>
  );
}
