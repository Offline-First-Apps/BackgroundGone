import { useCallback, useEffect, useRef } from "react";

import { useApp } from "./app-store";
import * as native from "./native";
import { inTauri } from "./window-controls";

/**
 * Processes the batch queue sequentially (Tauri only): one image in flight at a
 * time, updating each item's status live. Returns a `cancel()` for "Cancel all".
 *
 * StrictMode-safe: the run is guarded to fire exactly once per mount, and the
 * loop is NOT torn down by the effect cleanup (StrictMode's mount→cleanup→mount
 * would otherwise abandon the first run and skip the second). Cancellation is
 * driven explicitly by the returned `cancel()` / user actions instead.
 */
export function useBatch() {
  const store = useApp();
  const ref = useRef(store);
  ref.current = store;
  const didRun = useRef(false);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!inTauri() || didRun.current) return;
    didRun.current = true;
    cancelled.current = false;

    void (async () => {
      for (const item of ref.current.batch) {
        if (cancelled.current) break;
        if (!item.path || item.status === "done" || item.status === "failed") {
          continue;
        }
        ref.current.updateBatchItem(item.id, { status: "processing" });
        try {
          const res = await native.runRemoval(item.path);
          if (cancelled.current) break;
          ref.current.updateBatchItem(item.id, {
            status: "done",
            outputPath: res.path,
          });
        } catch (e) {
          if (cancelled.current) break;
          ref.current.updateBatchItem(item.id, {
            status: "failed",
            error: e instanceof Error ? e.message : "Failed",
          });
        }
      }
    })();
  }, []);

  return useCallback(() => {
    cancelled.current = true;
  }, []);
}
