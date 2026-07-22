import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WindowFooter } from "@/components/window-footer";
import { useApp } from "@/lib/app-store";
import { formatBytes, formatDimensions } from "@/lib/image";
import { STAGES, stageStatus, type StageStatus } from "@/lib/types";

const STAGE_CAPTIONS = [
  "Loading model",
  "Preprocessing image",
  "Running inference",
  "Exporting result",
];

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function StageRow({ label, status }: { label: string; status: StageStatus }) {
  return (
    <div className="flex items-center gap-[11px]">
      {status === "done" && <CheckIcon />}
      {status === "active" && (
        <span className="size-[15px] rounded-full border-2 border-[var(--spin-track)] border-t-brand animate-bg-spin" />
      )}
      {status === "idle" && (
        <span className="m-0.5 size-[11px] rounded-full border-2 border-[var(--idle-border)]" />
      )}
      <span
        className={
          status === "active"
            ? "text-[13px] font-medium text-fg"
            : status === "done"
              ? "text-[13px] text-muted"
              : "text-[13px] text-fg-3"
        }
      >
        {label}
      </span>
    </div>
  );
}

export function ProcessingScreen() {
  const { source, progress, stageIndex, reset } = useApp();
  const remaining = Math.max(1, Math.ceil(((100 - progress) / 100) * 4));
  const caption = STAGE_CAPTIONS[Math.min(stageIndex, STAGE_CAPTIONS.length - 1)];

  return (
    <>
      <div className="flex min-h-0 flex-1">
        {/* Preview pane */}
        <div className="flex flex-[1.15] items-center justify-center border-r border-pane-border bg-pane p-8">
          <div className="relative flex max-h-full w-full max-w-[400px] items-end justify-start overflow-hidden rounded-xl">
            {source && (
              <img
                src={source.url}
                alt={source.name}
                className="max-h-full w-full rounded-xl object-contain"
              />
            )}
            <span className="absolute bottom-4 left-4 rounded-md bg-[var(--overlay)] px-2 py-[3px] font-mono text-[11.5px] text-fg-3 backdrop-blur-sm">
              {source?.name ?? "image"}
            </span>
          </div>
        </div>

        {/* Progress panel */}
        <div className="flex flex-1 flex-col items-center justify-center p-11">
          <div className="w-full max-w-[300px]">
            <div className="mb-5 text-center text-base font-medium text-fg">
              Removing background…
            </div>

            <Progress value={progress} />

            <div className="mt-3 flex justify-between font-mono text-xs text-muted">
              <span>{caption}</span>
              <span className="text-fg">{Math.round(progress)}%</span>
            </div>

            <div className="mt-[26px] flex flex-col gap-[11px]">
              {STAGES.map((stage, i) => (
                <StageRow
                  key={stage.id}
                  label={stage.label}
                  status={stageStatus(i, stageIndex)}
                />
              ))}
            </div>

            <div className="mt-6 text-center font-mono text-[11.5px] text-fg-3">
              ~{remaining}s remaining
            </div>
          </div>
        </div>
      </div>

      <WindowFooter className="h-[66px]">
        <span className="font-mono text-xs text-meta">
          {source
            ? `${source.name} · ${formatDimensions(source.width, source.height)} · ${formatBytes(source.sizeBytes)}`
            : ""}
        </span>
        <Button variant="control" size="wide" onClick={reset}>
          Cancel
        </Button>
      </WindowFooter>
    </>
  );
}
