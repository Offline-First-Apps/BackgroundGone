import { useApp } from "@/lib/app-store";

/** Titlebar "Start over" control shown on the result screen. */
export function StartOverButton() {
  const { reset } = useApp();
  return (
    <button
      onClick={reset}
      className="flex items-center gap-2 rounded-lg py-[5px] pl-2 pr-2.5 text-icon transition-colors hover:bg-[var(--icon-hover-bg)] hover:text-fg"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-[13px] text-fg-1">Start over</span>
    </button>
  );
}
