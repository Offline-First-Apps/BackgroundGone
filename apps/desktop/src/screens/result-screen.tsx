import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WindowFooter } from "@/components/window-footer";
import { useApp } from "@/lib/app-store";
import { formatBytes, formatDimensions } from "@/lib/image";

const LOUPE = 92;
const ZOOM = 1.5;

interface LoupeState {
  cx: number;
  cy: number;
  bgX: number;
  bgY: number;
  bgW: number;
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function ResultScreen() {
  const { source, result } = useApp();
  const rootRef = useRef<HTMLDivElement>(null);
  const resultPaneRef = useRef<HTMLDivElement>(null);
  const resultImgRef = useRef<HTMLImageElement>(null);

  const [divider, setDivider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [loupe, setLoupe] = useState<LoupeState | null>(null);

  // Divider drag
  useEffect(() => {
    if (!dragging) return;
    function move(e: PointerEvent) {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      const pct = ((e.clientX - r.left) / r.width) * 100;
      setDivider(Math.min(88, Math.max(12, pct)));
    }
    function up() {
      setDragging(false);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  function updateLoupe(e: React.PointerEvent) {
    if (dragging) return setLoupe(null);
    const img = resultImgRef.current;
    const pane = resultPaneRef.current;
    if (!img || !pane) return;
    const r = img.getBoundingClientRect();
    const pr = pane.getBoundingClientRect();
    const ix = e.clientX - r.left;
    const iy = e.clientY - r.top;
    if (ix < 0 || iy < 0 || ix > r.width || iy > r.height) {
      setLoupe(null);
      return;
    }
    setLoupe({
      cx: e.clientX - pr.left,
      cy: e.clientY - pr.top,
      bgW: r.width * ZOOM,
      bgX: LOUPE / 2 - ix * ZOOM,
      bgY: LOUPE / 2 - iy * ZOOM,
    });
  }

  return (
    <>
      <div ref={rootRef} className="relative flex min-h-0 flex-1">
        {/* Original */}
        <div
          className="relative flex items-center justify-center overflow-hidden bg-pane p-8"
          style={{ width: `${divider}%` }}
        >
          <div className="absolute left-5 top-5 flex flex-col gap-1.5">
            <Badge variant="label">Original</Badge>
            {source && (
              <span className="self-start rounded-md bg-[var(--overlay)] px-2 py-[3px] font-mono text-[10.5px] text-muted backdrop-blur-sm">
                {formatDimensions(source.width, source.height)} ·{" "}
                {formatBytes(source.sizeBytes)}
              </span>
            )}
          </div>
          {source && (
            <img
              src={source.url}
              alt="Original"
              className="max-h-full w-full max-w-[340px] rounded-[10px] object-contain"
            />
          )}
        </div>

        {/* Result (on transparency) */}
        <div
          ref={resultPaneRef}
          onPointerMove={updateLoupe}
          onPointerLeave={() => setLoupe(null)}
          className="checkerboard relative flex items-center justify-center overflow-hidden p-8"
          style={{ width: `${100 - divider}%` }}
        >
          <div className="absolute left-5 top-5 z-10 flex flex-col gap-1.5">
            <Badge variant="label">Result</Badge>
            {result && (
              <span className="self-start rounded-md bg-[var(--overlay)] px-2 py-[3px] font-mono text-[10.5px] text-fg-1 backdrop-blur-sm">
                {result.format.toUpperCase()} · transparent ·{" "}
                {formatBytes(result.sizeBytes)}
              </span>
            )}
          </div>

          {result && (
            <img
              ref={resultImgRef}
              src={result.url}
              alt="Result"
              className="max-h-full w-full max-w-[340px] rounded-[10px] object-contain shadow-[0_10px_40px_-8px_rgba(0,0,0,0.4)]"
            />
          )}

          {/* Hover zoom loupe */}
          {loupe && result && (
            <div
              className="checkerboard pointer-events-none absolute z-30 overflow-hidden rounded-full border-2 border-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              style={{
                width: LOUPE,
                height: LOUPE,
                left: loupe.cx - LOUPE / 2,
                top: loupe.cy - LOUPE / 2,
              }}
            >
              <img
                src={result.url}
                alt=""
                className="absolute left-0 top-0 max-w-none"
                style={{
                  width: loupe.bgW,
                  transform: `translate(${loupe.bgX}px, ${loupe.bgY}px)`,
                }}
              />
              <span className="absolute bottom-[5px] right-[5px] rounded-[5px] bg-black/50 px-[5px] py-px font-mono text-[9px] text-white">
                150%
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
          style={{ left: `${divider}%` }}
        >
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            aria-label="Drag to compare"
            className="absolute left-1/2 top-1/2 flex size-[38px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center gap-px rounded-full bg-white text-[#18181b] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 8l-3 4 3 4" />
              <path d="M13 8l3 4-3 4" />
            </svg>
          </button>
        </div>
      </div>

      <WindowFooter className="h-[74px]">
        <span className="font-mono text-[11.5px] text-fg-3">
          Drag divider to compare · hover to zoom
        </span>
        <div className="flex items-center gap-2.5">
          <Button variant="control" size="icon" aria-label="Copy to clipboard">
            <CopyIcon />
          </Button>
          <Button variant="control" size="default">
            Export JPG
          </Button>
          <Button variant="brand" size="wide">
            <DownloadIcon />
            Export PNG
          </Button>
        </div>
      </WindowFooter>
    </>
  );
}
