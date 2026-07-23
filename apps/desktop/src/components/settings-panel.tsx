import { useEffect, type ReactNode } from "react";

import * as native from "@/lib/native";
import { useSettings } from "@/lib/settings-store";
import type { Settings } from "@/lib/types";
import { inTauri } from "@/lib/window-controls";

function Segmented<T extends string>({
  value,
  options,
  onChange,
  variant = "brand",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  variant?: "brand" | "neutral";
}) {
  return (
    <div className="flex rounded-[9px] border border-[var(--ctrl-border)] bg-[var(--ctrl-bg)] p-[3px]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-[7px] py-[7px] text-center text-[13px] transition-colors ${
              active
                ? variant === "brand"
                  ? "bg-brand font-semibold text-white"
                  : "bg-[var(--edge-header)] font-semibold text-fg"
                : "font-medium text-fg-1 hover:text-fg"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className={`flex h-6 w-[42px] shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "justify-end bg-brand" : "justify-start bg-track"
      }`}
    >
      <span className="size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
    </button>
  );
}

function Row({
  title,
  desc,
  children,
  inline,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className="border-b border-edge-header px-6 py-[11px]">
      {inline ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-fg">{title}</div>
            {desc && <div className="mt-0.5 text-[12.5px] text-fg-2">{desc}</div>}
          </div>
          {children}
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-fg">{title}</div>
          {desc && <div className="mb-2 mt-0.5 text-[12.5px] text-fg-2">{desc}</div>}
          {children}
        </>
      )}
    </div>
  );
}

export function SettingsPanel() {
  const { open, setOpen, settings, update, reset, provider } = useSettings();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const folderLabel = settings.outputDir
    ? (settings.outputDir.split(/[\\/]/).pop() ?? settings.outputDir)
    : "Same folder as source";

  async function changeFolder() {
    if (!inTauri()) return;
    const dir = await native.pickFolder();
    if (dir) update({ outputDir: dir });
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-[400px] max-w-[90vw] flex-col border-l border-win-border bg-win shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-edge-header px-6 py-[15px]">
          <span className="text-[17px] font-semibold text-fg">Settings</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close settings"
            className="flex size-[30px] items-center justify-center rounded-lg border border-[var(--ctrl-border)] bg-[var(--ctrl-bg)] text-fg-1 transition-colors hover:bg-[var(--ctrl-bg-hover)] hover:text-fg"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <Row title="Output format" desc="Default for one-click export">
            <Segmented<Settings["format"]>
              value={settings.format}
              onChange={(format) => update({ format })}
              options={[
                { value: "png", label: "PNG · transparent" },
                { value: "jpg", label: "JPG · white" },
              ]}
            />
          </Row>

          <Row title="Output folder" desc={folderLabel} inline>
            <button
              onClick={changeFolder}
              className="flex h-[34px] shrink-0 items-center rounded-lg border border-[var(--ctrl-border)] bg-[var(--ctrl-bg)] px-[14px] text-[12.5px] font-medium text-fg transition-colors hover:border-[var(--ctrl-border-hover)] hover:bg-[var(--ctrl-bg-hover)]"
            >
              Change…
            </button>
          </Row>

          <Row title="Quality">
            <Segmented<Settings["quality"]>
              value={settings.quality}
              onChange={(quality) => update({ quality })}
              variant="neutral"
              options={[
                { value: "fast", label: "Fast" },
                { value: "best", label: "Best" },
              ]}
            />
          </Row>

          <Row
            title="GPU acceleration"
            desc={
              provider === "CPU"
                ? "CPU only · rebuild with a GPU feature"
                : `${provider} · auto-detected`
            }
            inline
          >
            <Toggle
              checked={settings.gpu && provider !== "CPU"}
              onChange={() => update({ gpu: !settings.gpu })}
            />
          </Row>

          <Row title="File name suffix" desc="Appended before the extension">
            <div className="flex items-center gap-0.5 rounded-[9px] border border-[var(--ctrl-border)] bg-[var(--pane)] px-3 py-2 font-mono text-[13px]">
              <span className="text-fg-2">name</span>
              <input
                value={settings.suffix}
                onChange={(e) => update({ suffix: e.target.value })}
                size={Math.max(4, settings.suffix.length + 1)}
                className="bg-transparent text-fg outline-none"
                spellCheck={false}
              />
              <span className="text-fg-2">.{settings.format}</span>
            </div>
          </Row>
        </div>

        <div className="flex items-center justify-between border-t border-edge-header px-6 py-3">
          <button
            onClick={reset}
            className="text-[13px] text-fg-1 transition-colors hover:text-fg"
          >
            Reset to defaults
          </button>
          <span className="font-mono text-[11.5px] text-fg-3">Esc to close</span>
        </div>
      </aside>
    </div>
  );
}
