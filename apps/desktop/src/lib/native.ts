// Bridge to the Rust background-removal engine (Tauri only). All functions
// assume they are called inside Tauri — callers guard with `inTauri()`.

import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { ExportFormat, ImageMeta, ResultMeta } from "./types";

export const ACCEPT_EXTS = ["png", "jpg", "jpeg", "webp"];

interface ImageInfo {
  width: number;
  height: number;
  size: number;
}

function basename(p: string): string {
  return p.split(/[\\/]/).pop() ?? p;
}

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

/** Native open dialog → absolute path (or null if cancelled). */
export async function pickImagePath(): Promise<string | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    multiple: false,
    filters: [{ name: "Images", extensions: ACCEPT_EXTS }],
  });
  return typeof selected === "string" ? selected : null;
}

/** Build ImageMeta for a path — dimensions/size come from Rust, preview via
 * the asset protocol (no bytes cross the IPC bridge). */
export async function intakeFromPath(path: string): Promise<ImageMeta> {
  const info = await invoke<ImageInfo>("image_info", { path });
  return {
    name: basename(path),
    width: info.width,
    height: info.height,
    sizeBytes: info.size,
    url: convertFileSrc(path),
    path,
  };
}

export interface ProgressEvent {
  stage: string;
  percent: number;
}

/** Run real inference; forwards Rust `process-progress` events to `onProgress`. */
export async function runRemoval(
  inputPath: string,
  onProgress: (p: ProgressEvent) => void,
): Promise<ResultMeta> {
  const unlisten = await listen<ProgressEvent>("process-progress", (e) =>
    onProgress(e.payload),
  );
  try {
    const outPath = await invoke<string>("process_image", {
      inputPath,
      format: "png",
    });
    const info = await invoke<ImageInfo>("image_info", { path: outPath });
    return {
      url: convertFileSrc(outPath),
      path: outPath,
      format: "png",
      sizeBytes: info.size,
      width: info.width,
      height: info.height,
    };
  } finally {
    unlisten();
  }
}

/** Save-as dialog + write the result in the chosen format. Returns false if
 * the user cancelled. */
export async function exportResult(
  srcPath: string,
  format: ExportFormat,
  sourceName: string,
): Promise<boolean> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const dest = await save({
    defaultPath: `${stripExt(sourceName)}_nobg.${format}`,
    filters: [{ name: format.toUpperCase(), extensions: [format] }],
  });
  if (!dest) return false;
  await invoke("export_result", { srcPath, destPath: dest });
  return true;
}

export async function copyResult(srcPath: string): Promise<void> {
  await invoke("copy_result", { srcPath });
}
