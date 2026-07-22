import type { ReactNode } from "react";

import { Titlebar } from "@/components/titlebar";

/*
 * The application window: titlebar + a flexible content region. Screens
 * render their own footer inside `children` (heights differ per screen).
 * Fills the viewport so it behaves like the real desktop window; the Tauri
 * shell will later supply the OS chrome around this.
 */
export function AppWindow({
  children,
  titlebarLeft,
}: {
  children: ReactNode;
  titlebarLeft?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen flex-col bg-win text-fg">
      <Titlebar left={titlebarLeft} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
