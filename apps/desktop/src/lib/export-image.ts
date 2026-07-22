import type { ExportFormat } from "./types";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

async function renderToBlob(
  url: string,
  type: string,
  background?: string,
): Promise<Blob> {
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      type,
      0.95,
    );
  });
}

export function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Copy the result as a PNG to the system clipboard. */
export async function copyResultToClipboard(url: string): Promise<void> {
  const blob = await renderToBlob(url, "image/png");
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}

/**
 * Export the result. PNG keeps transparency; JPG is flattened onto white
 * (JPEG has no alpha channel). Never overwrites the original — always `_nobg`.
 */
export async function downloadResult(
  url: string,
  sourceName: string,
  format: ExportFormat,
): Promise<void> {
  const type = format === "jpg" ? "image/jpeg" : "image/png";
  const background = format === "jpg" ? "#ffffff" : undefined;
  const blob = await renderToBlob(url, type, background);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${baseName(sourceName)}_nobg.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
