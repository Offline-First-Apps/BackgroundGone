export type Screen = "empty" | "processing" | "result" | "batch";

export type ExportFormat = "png" | "jpg";

export type BatchStatus = "queued" | "processing" | "done" | "failed";

/** One image in the batch queue. */
export interface BatchItem {
  id: string;
  name: string;
  path?: string;
  url?: string;
  status: BatchStatus;
  outputPath?: string;
  error?: string;
}

/** Persisted user settings (mirrors the Rust AppSettings). */
export interface Settings {
  format: ExportFormat;
  outputDir: string | null;
  quality: "fast" | "best";
  gpu: boolean;
  suffix: string;
}

export interface EngineInfo {
  provider: string;
  gpu: boolean;
  ready: boolean;
}

/** Metadata for a loaded source image. `url` is a preview URL; `path` is the
 * OS path (present only under Tauri, used for native inference). */
export interface ImageMeta {
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  url: string;
  path?: string;
}

/** The produced (background-removed) image. */
export interface ResultMeta {
  url: string;
  format: ExportFormat;
  sizeBytes: number;
  width: number;
  height: number;
  path?: string;
}

/** A step in the (currently simulated) removal pipeline. */
export interface Stage {
  id: string;
  label: string;
}

export const STAGES: readonly Stage[] = [
  { id: "load", label: "Load model" },
  { id: "preprocess", label: "Preprocess image" },
  { id: "infer", label: "Run inference" },
  { id: "export", label: "Export result" },
] as const;

export type StageStatus = "done" | "active" | "idle";

export function stageStatus(index: number, activeIndex: number): StageStatus {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "idle";
}
