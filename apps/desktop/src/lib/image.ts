import type { ImageMeta } from "./types";

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || file.type.startsWith("image/");
}

/** Load an image File and resolve its intrinsic dimensions + a preview URL. */
export function readImageMeta(file: File): Promise<ImageMeta> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: file.size,
        url,
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}
