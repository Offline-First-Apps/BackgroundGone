import { isTauri } from "@tauri-apps/api/core";

/** True only inside the Tauri webview (false in the plain `vite` browser dev). */
export function inTauri(): boolean {
  return typeof window !== "undefined" && isTauri();
}

async function currentWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export async function closeWindow() {
  if (!inTauri()) return;
  await (await currentWindow()).close();
}

export async function minimizeWindow() {
  if (!inTauri()) return;
  await (await currentWindow()).minimize();
}

export async function toggleMaximizeWindow() {
  if (!inTauri()) return;
  await (await currentWindow()).toggleMaximize();
}
