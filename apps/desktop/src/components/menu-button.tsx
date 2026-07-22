import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* The exact hamburger mark from the mockup: three rules with knockout dots
 * (the dots are filled with the window background so they read as cut-outs). */
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="10" cy="7" r="2.4" fill="var(--win)" stroke="none" />
      <circle cx="16" cy="12" r="2.4" fill="var(--win)" stroke="none" />
      <circle cx="8" cy="17" r="2.4" fill="var(--win)" stroke="none" />
    </svg>
  );
}

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="chrome"
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuIcon />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-xl border border-win-border bg-win p-1 shadow-[var(--win-shadow)]"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-fg-3">
            Theme
          </div>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-fg-1 transition-colors hover:bg-[var(--icon-hover-bg)] hover:text-fg"
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.8} />
              <span className="flex-1 text-left">{label}</span>
              <Check
                className={cn(
                  "size-3.5 text-brand transition-opacity",
                  theme === value ? "opacity-100" : "opacity-0",
                )}
                strokeWidth={2.6}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
