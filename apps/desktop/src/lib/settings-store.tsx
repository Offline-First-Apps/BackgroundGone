import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as native from "./native";
import type { Settings } from "./types";
import { inTauri } from "./window-controls";

const DEFAULTS: Settings = {
  format: "png",
  outputDir: null,
  quality: "best",
  gpu: true,
  suffix: "_nobg",
};

interface SettingsStore {
  open: boolean;
  setOpen: (b: boolean) => void;
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  /** Compiled execution provider (e.g. "DirectML", "CPU"). */
  provider: string;
}

const Ctx = createContext<SettingsStore | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [provider, setProvider] = useState("CPU");

  useEffect(() => {
    if (!inTauri()) return;
    native.getSettings().then(setSettings).catch(() => {});
    native
      .getEngineInfo()
      .then((e) => setProvider(e.provider))
      .catch(() => {});
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    if (inTauri()) void native.setSettings(next);
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) =>
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (inTauri()) void native.setSettings(next);
        return next;
      }),
    [],
  );

  const reset = useCallback(() => persist(DEFAULTS), [persist]);

  return (
    <Ctx.Provider value={{ open, setOpen, settings, update, reset, provider }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings(): SettingsStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
