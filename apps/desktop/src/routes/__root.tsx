import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="h-full min-h-screen bg-win text-fg">
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
