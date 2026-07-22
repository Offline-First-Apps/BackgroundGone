export type Screen = "empty" | "processing" | "result";

export type ExportFormat = "png" | "jpg";

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
