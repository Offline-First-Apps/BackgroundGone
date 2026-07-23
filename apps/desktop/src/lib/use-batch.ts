import { useEffect, useRef } from "react";

import { useApp } from "./app-store";
import * as native from "./native";
import { inTauri } from "./window-controls";

/**
 * Processes the batch queue sequentially (Tauri only): one image in flight at a
 * time, updating each item's status live. Cancel-all unmounts the screen, which
 * flips the guard and stops the loop after the in-flight item aborts.
 */
export function useBatch() {
  const store = useApp();
  const ref = useRef(store);
  ref.current = store;
  const started = useRef(false);

  useEffect(() => {
    if (!inTauri() || started.current) return;
    started.current = true;
    let cancelled = false;

    void (async () => {
      for (const item of ref.current.batch) {
        if (cancelled) break;
        if (item.status !== "queued" || !item.path) continue;
        ref.current.updateBatchItem(item.id, { status: "processing" });
        try {
          const res = await native.runRemoval(item.path);
          if (cancelled) break;
          ref.current.updateBatchItem(item.id, {
            status: "done",
            outputPath: res.path,
          });
        } catch (e) {
          if (cancelled) break;
          ref.current.updateBatchItem(item.id, {
            status: "failed",
            error: e instanceof Error ? e.message : "Failed",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
