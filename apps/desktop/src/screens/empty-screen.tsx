import { useCallback, useEffect, useRef, useState } from "react";

import { DropZone } from "@/components/drop-zone";
import { WindowFooter } from "@/components/window-footer";
import { useApp } from "@/lib/app-store";
import { ACCEPTED_TYPES, isAcceptedImage, readImageMeta } from "@/lib/image";

export function EmptyScreen() {
  const { startProcessing } = useApp();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = Array.from(files).find(isAcceptedImage);
      if (!file) return;
      const meta = await readImageMeta(file);
      startProcessing(meta);
    },
    [startProcessing],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  // Ctrl/Cmd+O opens the file picker, matching the on-screen hint.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        openPicker();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPicker]);

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
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
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
