import { useEffect, useRef } from "react";

import { useApp } from "./app-store";

/** Rough duration of the fake pipeline, ms. */
const DURATION = 3600;
/** Brief hold at 100% so the "Export result" stage reads as complete. */
const EXPORT_HOLD = 350;

function stageForProgress(p: number): number {
  if (p < 25) return 0;
  if (p < 50) return 1;
  if (p < 90) return 2;
  return 3;
}

/*
 * Simulates the background-removal pipeline while the real RMBG model is not
 * bundled: animates progress 0→100, walks the stages, then finishes into the
 * result screen. The uploaded image stands in for the isolated subject. Swap
 * this out for the real Rust/ONNX invocation once the model ships.
 */
export function useSimulatedRemoval() {
  const store = useApp();
  const ref = useRef(store);
  ref.current = store;

  useEffect(() => {
    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const start = performance.now();

    function tick(now: number) {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / DURATION);
      const p = Math.round(t * 100);
      ref.current.setProgress(p);
      ref.current.setStage(stageForProgress(p));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      hold = setTimeout(() => {
        if (cancelled) return;
        const src = ref.current.source;
        if (!src) return;
        ref.current.finish({
          url: src.url,
          format: "png",
          sizeBytes: Math.max(1, Math.round(src.sizeBytes * 0.3)),
          width: src.width,
          height: src.height,
        });
      }, EXPORT_HOLD);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (hold) clearTimeout(hold);
    };
  }, []);
}
