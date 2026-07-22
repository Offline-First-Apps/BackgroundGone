"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const;

/** Compact segmented theme switch used in the landing nav. */
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = mounted ? theme : undefined;

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--pill-border)] bg-[var(--pill)] p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          aria-label={label}
          aria-pressed={active === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-colors",
            active === value
              ? "bg-[var(--navlink-hover-bg)] text-[var(--navlink-hover-fg)] shadow-sm"
              : "text-[var(--navlink)] hover:text-[var(--navlink-hover-fg)]",
          )}
        >
          <Icon className="size-[15px]" strokeWidth={1.9} />
        </button>
      ))}
    </div>
  );
}
