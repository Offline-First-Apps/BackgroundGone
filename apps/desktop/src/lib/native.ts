// Bridge to the Rust background-removal engine (Tauri only). All functions
// assume they are called inside Tauri — callers guard with `inTauri()`.

import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type {
  EngineInfo,
  ExportFormat,
  ImageMeta,
  ResultMeta,
  Settings,
} from "./types";

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

/** Native open dialog → absolute path(s). */
export async function pickImages(multiple = false): Promise<string[]> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    multiple,
    filters: [{ name: "Images", extensions: ACCEPT_EXTS }],
  });
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

/** Expand a drop/selection: directories → contained images. */
export function expandPaths(paths: string[]): Promise<string[]> {
  return invoke<string[]>("expand_paths", { paths });
}

/** Build ImageMeta for a path — dimensions/size from Rust, preview via asset. */
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

/** Run real inference; forwards `process-progress` events to `onProgress`. */
export async function runRemoval(
  inputPath: string,
  onProgress?: (p: ProgressEvent) => void,
): Promise<ResultMeta> {
  const unlisten = onProgress
    ? await listen<ProgressEvent>("process-progress", (e) => onProgress(e.payload))
    : undefined;
  try {
    const outPath = await invoke<string>("process_image", { inputPath });
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
    unlisten?.();
  }
}

export function cancelProcessing(): Promise<void> {
  return invoke("cancel_processing");
}

export function getSettings(): Promise<Settings> {
  return invoke<Settings>("get_settings");
}

export function setSettings(settings: Settings): Promise<void> {
  return invoke("set_settings", { settings });
}

export function getEngineInfo(): Promise<EngineInfo> {
  return invoke<EngineInfo>("engine_info");
}

/** Save-as dialog + write the result in the chosen format. */
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

export function openFolder(path: string): Promise<void> {
  return invoke("open_folder", { path });
}
