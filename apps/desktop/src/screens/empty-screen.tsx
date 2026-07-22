import { useCallback, useEffect, useRef, useState } from "react";

import { DropZone } from "@/components/drop-zone";
import { WindowFooter } from "@/components/window-footer";
import { useApp } from "@/lib/app-store";
import { ACCEPTED_TYPES, isAcceptedImage, readImageMeta } from "@/lib/image";
import * as native from "@/lib/native";
import { inTauri } from "@/lib/window-controls";

export function EmptyScreen() {
  const { startProcessing } = useApp();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  // Browser: intake from a File.
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = Array.from(files).find(isAcceptedImage);
      if (!file) return;
      startProcessing(await readImageMeta(file));
    },
    [startProcessing],
  );

  // Tauri: intake from an OS path.
  const handlePath = useCallback(
    async (path: string) => {
      startProcessing(await native.intakeFromPath(path));
    },
    [startProcessing],
  );

  const openPicker = useCallback(async () => {
    if (inTauri()) {
      const path = await native.pickImagePath();
      if (path) await handlePath(path);
    } else {
      inputRef.current?.click();
    }
  }, [handlePath]);

  // Ctrl/Cmd+O opens the picker, matching the on-screen hint.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        void openPicker();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPicker]);

  // Tauri delivers OS file drops as path events (DOM drop is suppressed).
  useEffect(() => {
    if (!inTauri()) return;
    let unlisten: (() => void) | undefined;
    void (async () => {
      const { getCurrentWebview } = await import("@tauri-apps/api/webview");
      unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        const p = event.payload;
        if (p.type === "enter" || p.type === "over") setDragging(true);
        else if (p.type === "leave") setDragging(false);
        else if (p.type === "drop") {
          setDragging(false);
          const path = p.paths?.[0];
          if (path) void handlePath(path);
        }
      });
    })();
    return () => unlisten?.();
  }, [handlePath]);

  return (
    <>
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 p-10"
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <DropZone
          dragging={dragging}
          onClick={() => void openPicker()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              void openPicker();
            }
          }}
        />
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <WindowFooter className="h-[52px]">
        <span className="text-[12.5px] text-fg-3">
          Tip: Drop a folder to process multiple images
        </span>
        <div className="flex items-center gap-2">
          <span className="size-[7px] rounded-full bg-green" />
          <span className="text-xs text-label">Offline · 100% on-device</span>
        </div>
      </WindowFooter>
    </>
  );
}
