import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WindowFooter } from "@/components/window-footer";
import { useApp } from "@/lib/app-store";
import { formatBytes, formatDimensions } from "@/lib/image";

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
  const divider = 50;

  return (
    <>
      <div className="relative flex min-h-0 flex-1">
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

          {/* Zoom loupe */}
          <div className="checkerboard pointer-events-none absolute right-9 top-16 size-[92px] overflow-hidden rounded-full border-2 border-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            {result && (
              <img
                src={result.url}
                alt=""
                className="absolute left-1/2 top-1/2 h-auto w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
            )}
            <span className="absolute bottom-[5px] right-[5px] rounded-[5px] bg-black/50 px-[5px] py-px font-mono text-[9px] text-white">
              150%
            </span>
          </div>

          {result && (
            <img
              src={result.url}
              alt="Result"
              className="max-h-full w-full max-w-[340px] rounded-[10px] object-contain shadow-[0_10px_40px_-8px_rgba(0,0,0,0.4)]"
            />
          )}
        </div>

        {/* Divider */}
        <div
          className="absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
          style={{ left: `${divider}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex size-[38px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center gap-px rounded-full bg-white text-[#18181b] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 8l-3 4 3 4" />
              <path d="M13 8l3 4-3 4" />
            </svg>
          </div>
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
