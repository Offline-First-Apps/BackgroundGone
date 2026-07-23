import { isTauri } from "@tauri-apps/api/core";

/** True only inside the Tauri webview (false in the plain `vite` browser dev). */
export function inTauri(): boolean {
  return typeof window !== "undefined" && isTauri();
}
