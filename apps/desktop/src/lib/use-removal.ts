import { useEffect, useRef } from "react";

import { useApp } from "./app-store";
import * as native from "./native";
import { inTauri } from "./window-controls";

const STAGE_INDEX: Record<string, number> = {
  load: 0,
  preprocess: 1,
  infer: 2,
  export: 3,
};

/**
 * Drives a processing job to completion. Inside Tauri (with a real file path)
 * it invokes the Rust ONNX engine and forwards progress events; in the plain
 * browser preview it falls back to a simulated timeline so `pnpm dev` stays a
 * fast UI loop.
 */
export function useRemoval() {
  const store = useApp();
  const ref = useRef(store);
  ref.current = store;

  useEffect(() => {
    const source = ref.current.source;
    let cancelled = false;

    // ---- Real inference (Tauri) ----
    if (inTauri() && source?.path) {
      native
        .runRemoval(source.path, (p) => {
          if (cancelled) return;
          ref.current.setProgress(Math.round(p.percent));
          const i = STAGE_INDEX[p.stage];
          if (i !== undefined) ref.current.setStage(i);
        })
        .then((result) => {
          if (!cancelled) ref.current.finish(result);
        })
        .catch((err) => {
          console.error("[removal] failed:", err);
          if (!cancelled) ref.current.reset();
        });
      return () => {
        cancelled = true;
      };
    }

    // ---- Simulated fallback (browser) ----
    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    const DURATION = 3600;
    const stageFor = (p: number) => (p < 25 ? 0 : p < 50 ? 1 : p < 90 ? 2 : 3);

    function tick(now: number) {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / DURATION);
      const p = Math.round(t * 100);
      ref.current.setProgress(p);
      ref.current.setStage(stageFor(p));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      hold = setTimeout(() => {
        if (cancelled) return;
        const s = ref.current.source;
        if (!s) return;
        ref.current.finish({
          url: s.url,
          format: "png",
          sizeBytes: Math.max(1, Math.round(s.sizeBytes * 0.3)),
          width: s.width,
          height: s.height,
        });
      }, 350);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
    };
  }, []);
}
