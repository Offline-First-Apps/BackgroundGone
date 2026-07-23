import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { BatchItem, ImageMeta, ResultMeta, Screen } from "./types";

interface AppState {
  screen: Screen;
  source: ImageMeta | null;
  result: ResultMeta | null;
  /** 0–100 for the processing bar. */
  progress: number;
  /** Index of the currently-active pipeline stage. */
  stageIndex: number;
  /** Batch queue (screen === "batch"). */
  batch: BatchItem[];
}

const initialState: AppState = {
  screen: "empty",
  source: null,
  result: null,
  progress: 0,
  stageIndex: 0,
  batch: [],
};

type Action =
  | { type: "START_PROCESSING"; source: ImageMeta }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_STAGE"; stageIndex: number }
  | { type: "FINISH"; result: ResultMeta }
  | { type: "START_BATCH"; items: BatchItem[] }
  | { type: "UPDATE_BATCH_ITEM"; id: string; patch: Partial<BatchItem> }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "START_PROCESSING":
      return {
        ...state,
        screen: "processing",
        source: action.source,
        result: null,
        progress: 0,
        stageIndex: 0,
      };
    case "SET_PROGRESS":
      return { ...state, progress: action.progress };
    case "SET_STAGE":
      return { ...state, stageIndex: action.stageIndex };
    case "FINISH":
      return {
        ...state,
        screen: "result",
        result: action.result,
        progress: 100,
        stageIndex: 4,
      };
    case "START_BATCH":
      return { ...state, screen: "batch", batch: action.items };
    case "UPDATE_BATCH_ITEM":
      return {
        ...state,
        batch: state.batch.map((it) =>
          it.id === action.id ? { ...it, ...action.patch } : it,
        ),
      };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

interface AppStore extends AppState {
  startProcessing: (source: ImageMeta) => void;
  setProgress: (progress: number) => void;
  setStage: (stageIndex: number) => void;
  finish: (result: ResultMeta) => void;
  startBatch: (items: BatchItem[]) => void;
  updateBatchItem: (id: string, patch: Partial<BatchItem>) => void;
  reset: () => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      startProcessing: (source) => dispatch({ type: "START_PROCESSING", source }),
      setProgress: (progress) => dispatch({ type: "SET_PROGRESS", progress }),
      setStage: (stageIndex) => dispatch({ type: "SET_STAGE", stageIndex }),
      finish: (result) => dispatch({ type: "FINISH", result }),
      startBatch: (items) => dispatch({ type: "START_BATCH", items }),
      updateBatchItem: (id, patch) =>
        dispatch({ type: "UPDATE_BATCH_ITEM", id, patch }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    [state],
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useApp(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useApp must be used within <AppStoreProvider>");
  return ctx;
}
