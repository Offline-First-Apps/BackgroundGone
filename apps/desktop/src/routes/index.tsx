import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">BackgroundGone</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Local-first background remover. Drop an image to remove its background —
        fully offline, nothing leaves your machine.
      </p>
    </main>
  );
}
