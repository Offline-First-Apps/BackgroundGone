import { createFileRoute } from "@tanstack/react-router";

import { AppWindow } from "@/components/app-window";
import { StartOverButton } from "@/components/start-over-button";
import { BatchScreen } from "@/screens/batch-screen";
import { EmptyScreen } from "@/screens/empty-screen";
import { ProcessingScreen } from "@/screens/processing-screen";
import { ResultScreen } from "@/screens/result-screen";
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

  if (screen === "batch") {
    return (
      <AppWindow titlebarLeft={<StartOverButton />}>
        <BatchScreen />
      </AppWindow>
    );
  }

  return (
    <AppWindow titlebarLeft={<StartOverButton />}>
      <ResultScreen />
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
