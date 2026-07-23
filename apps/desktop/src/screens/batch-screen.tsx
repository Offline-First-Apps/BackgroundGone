import { useState } from "react";

import { useApp } from "@/lib/app-store";
import * as native from "@/lib/native";
import { useBatch } from "@/lib/use-batch";
import { inTauri } from "@/lib/window-controls";
import type { BatchItem } from "@/lib/types";

function dirname(p: string): string {
  const i = p.lastIndexOf("/");
  const j = p.lastIndexOf("\\");
  const k = Math.max(i, j);
  return k > 0 ? p.slice(0, k) : p;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function StatusIcon({
  item,
  onRetry,
}: {
  item: BatchItem;
  onRetry: (i: BatchItem) => void;
}) {
  if (item.status === "done") return <CheckIcon />;
  if (item.status === "processing")
    return (
      <span className="size-4 shrink-0 animate-bg-spin rounded-full border-2 border-[var(--spin-track)] border-t-brand" />
    );
  if (item.status === "failed")
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onRetry(item)}
          className="text-[11.5px] text-fg-1 transition-colors hover:text-fg"
        >
          Retry
        </button>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff5252" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
    );
  return <span className="mr-1 size-2 shrink-0 rounded-full bg-[#4a4a4f]" />;
}

export function BatchScreen() {
  const { batch, updateBatchItem, reset } = useApp();
  const cancelBatch = useBatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const total = batch.length;
  const done = batch.filter((b) => b.status === "done").length;
  const failed = batch.filter((b) => b.status === "failed").length;
  const queued = total - done - failed;
  const processed = done + failed;
  const current = batch.find((b) => b.status === "processing");
  // User-picked row wins; otherwise follow the active item, then first done.
  const selected = selectedId
    ? batch.find((b) => b.id === selectedId)
    : undefined;
  const preview =
    selected ?? current ?? batch.find((b) => b.status === "done") ?? batch[0];

  async function retry(item: BatchItem) {
    if (!item.path) return;
    updateBatchItem(item.id, { status: "processing", error: undefined });
    try {
      const res = await native.runRemoval(item.path);
      updateBatchItem(item.id, {
        status: "done",
        outputPath: res.path,
        outputUrl: res.url,
      });
    } catch (e) {
      updateBatchItem(item.id, {
        status: "failed",
        error: e instanceof Error ? e.message : "Failed",
      });
    }
  }

  function cancelAll() {
    cancelBatch();
    if (inTauri()) void native.cancelProcessing();
    reset();
  }

  function openFolder() {
    const target = batch.find((b) => b.outputPath)?.outputPath ?? preview?.path;
    if (target && inTauri()) void native.openFolder(dirname(target));
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Preview pane — before + after for the selected item */}
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] bg-[var(--pane)] p-8">
        <div className="flex items-start gap-5">
          {/* Before */}
          <figure className="flex flex-col items-center gap-2.5">
            <div className="flex aspect-[3/4] w-[232px] items-center justify-center overflow-hidden rounded-xl bg-[var(--pane)] shadow-[0_14px_44px_-10px_rgba(0,0,0,0.6)]">
              {preview?.url ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <figcaption className="font-mono text-[11px] uppercase tracking-wide text-fg-3">
              Before
            </figcaption>
          </figure>

          {/* After */}
          <figure className="flex flex-col items-center gap-2.5">
            <div className="checkerboard flex aspect-[3/4] w-[232px] items-center justify-center overflow-hidden rounded-xl shadow-[0_14px_44px_-10px_rgba(0,0,0,0.6)]">
              {preview?.status === "done" && preview.outputUrl ? (
                <img
                  src={preview.outputUrl}
                  alt={`${preview.name} — background removed`}
                  className="size-full object-contain"
                />
              ) : preview?.status === "failed" ? (
                <span className="px-4 text-center text-[12px] leading-relaxed text-[#ff5252]">
                  {preview.error ?? "Failed"}
                </span>
              ) : (
                <span className="size-7 animate-bg-spin rounded-full border-[3px] border-[var(--spin-track)] border-t-brand" />
              )}
            </div>
            <figcaption className="font-mono text-[11px] uppercase tracking-wide text-fg-3">
              After
            </figcaption>
          </figure>
        </div>

        <span className="rounded-lg border border-[var(--win-border)] bg-[var(--overlay)] px-3 py-[5px] font-mono text-xs text-fg-1 backdrop-blur-sm">
          {queued > 0 || current
            ? `Now processing · ${Math.min(processed + 1, total)} of ${total}`
            : `Finished · ${done} of ${total}`}
        </span>
      </div>

      {/* Sidebar */}
      <div className="flex w-[352px] shrink-0 flex-col border-l border-edge-footer bg-win">
        <div className="border-b border-edge-footer p-5 pb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-fg">Queue</span>
            <span className="font-mono text-xs text-icon">
              {done} of {total}
            </span>
          </div>
          <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-brand transition-[width]"
              style={{ width: `${total ? (processed / total) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-[13px] flex gap-3.5 text-[11.5px] text-fg-1">
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] rounded-full bg-green" />
              {done} done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] rounded-full bg-[#ff5252]" />
              {failed} failed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] rounded-full bg-[#4a4a4f]" />
              {queued} queued
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {batch.map((item) => {
            const active = preview?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-[9px] px-2.5 py-[9px] ${
                  active
                    ? "border border-[var(--win-border)] bg-[var(--edge-header)]"
                    : "border border-transparent hover:bg-[var(--edge-header)]"
                }`}
              >
                <div className="size-[38px] shrink-0 overflow-hidden rounded-lg bg-[var(--pane)]">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate font-mono text-[12.5px] ${
                      item.status === "queued"
                        ? "text-fg-3"
                        : active
                          ? "text-fg"
                          : "text-fg-1"
                    }`}
                  >
                    {item.name}
                  </div>
                  {item.status === "failed" && (
                    <div className="mt-0.5 text-[11px] text-[#ff5252]">
                      {item.error ?? "Failed"}
                    </div>
                  )}
                </div>
                <StatusIcon item={item} onRetry={retry} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2.5 border-t border-edge-footer p-4">
          <button
            onClick={cancelAll}
            className="text-[13px] text-fg-1 transition-colors hover:text-[#ff5252]"
          >
            Cancel all
          </button>
          <button
            onClick={openFolder}
            className="flex h-9 items-center gap-2 rounded-[9px] border border-[var(--ctrl-border)] bg-[var(--ctrl-bg)] px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-[var(--ctrl-border-hover)] hover:bg-[var(--ctrl-bg-hover)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Open folder
          </button>
        </div>
      </div>
    </div>
  );
}
