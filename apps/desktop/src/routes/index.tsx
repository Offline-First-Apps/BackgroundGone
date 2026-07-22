import { createFileRoute } from "@tanstack/react-router";

import { AppWindow } from "@/components/app-window";
import { EmptyScreen } from "@/screens/empty-screen";
import { ProcessingScreen } from "@/screens/processing-screen";
import { AppStoreProvider, useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function Screens() {
  const { screen } = useApp();

  if (screen === "empty") {
    return (
      <AppWindow>
        <EmptyScreen />
      </AppWindow>
    );
  }

  if (screen === "processing") {
    return (
      <AppWindow>
        <ProcessingScreen />
      </AppWindow>
    );
  }

  // Result screen is added in the following steps.
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
