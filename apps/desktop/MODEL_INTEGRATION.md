# On-Device Background Removal — Implementation Plan

Integrating **`model_fp16.onnx`** into the Tauri desktop app for 100% local, offline
inference. This replaces the current simulated pipeline
(`src/lib/use-simulated-removal.ts`) with real ONNX Runtime inference in Rust.

Everything runs on the user's machine — no network, no uploads, ever.

---

## 0. Where we are today

- **Frontend (done):** `empty → processing → result` state machine
  (`src/lib/app-store.tsx`), `DropZone`, `ProcessingScreen` (staged progress),
  `ResultScreen` (compare slider + export). Today it runs
  `useSimulatedRemoval()` — a timer that fakes progress and reuses the source
  image as the "result".
- **Rust (done):** Tauri v2 shell in `src-tauri/` with an empty
  `lib.rs::run()`. `Cargo.toml` already stubs `directml` / `coreml` / `cuda`
  feature flags.
- **Goal:** swap the simulation for real inference behind the *same* store
  actions, so the UI barely changes.

---

## 1. Confirm the model contract first (blocking — do before any code)

`fp16` ONNX exports differ in their I/O dtype and preprocessing. Open the model
in **Netron** (or `onnx` Python) and record:

| Question | Expected (RMBG-2.0 / BiRefNet family) | Action if different |
| --- | --- | --- |
| Input name & shape | `[1, 3, 1024, 1024]` NCHW | adjust `PREP_SIZE` / layout |
| **Input dtype** | `float16` **or** `float32` | drives the `half` decision (§2) |
| Output name & shape | `[1, 1, 1024, 1024]` | handle multi-output models (take the matte) |
| Output dtype | `float16` / `float32` | cast on read |
| Normalization | ImageNet mean `[.485,.456,.406]`, std `[.229,.224,.225]` | **must match training** or masks are garbage |
| Sigmoid | already applied in-graph (0..1 output) | else apply `1/(1+e^-x)` in postprocess |

> ⚠️ Wrong normalization is the #1 cause of "it runs but the cutout is noise."
> Verify against the exact model card, don't assume.

---

## 2. Rust dependencies (`src-tauri/Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
ort = { version = "2", default-features = false, features = ["ndarray"] } # ONNX Runtime
ndarray = "0.16"
image = "0.25"
fast_image_resize = "5"   # fast, high-quality Lanczos resize
half = "2"                # only if the model's I/O is float16
anyhow = "1"
thiserror = "1"

[features]
default = []
directml = ["ort/directml"]  # Windows GPU
coreml   = ["ort/coreml"]    # macOS (Apple Silicon)
cuda     = ["ort/cuda"]      # NVIDIA
```

**ORT runtime binary:** `ort` needs the ONNX Runtime shared lib. Simplest for
offline shipping is the bundled/static strategy (`ort` downloads a prebuilt
binary at build time and links it) so the end user needs nothing installed.
Pin the `ort` version to a known-good ONNX Runtime release and verify the
binary is included in the app bundle.

**Tauri plugins (JS + Rust):** add `tauri-plugin-dialog` (native open/save) and
`tauri-plugin-fs` (write output), registered in `lib.rs`.

---

## 3. Model bundling & path resolution

- **Location:** `src-tauri/models/model_fp16.onnx`.
- **Bundle as a resource** (`src-tauri/tauri.conf.json`):
  ```json
  "bundle": { "resources": ["models/*"] }
  ```
- **Resolve at runtime** (never hardcode a dev path):
  ```rust
  app.path().resolve("models/model_fp16.onnx", BaseDirectory::Resource)?
  ```
- **Size / VCS:** an fp16 RMBG export is ~**350–450 MB**. Do **not** commit it
  to plain git.
  - Track via **Git LFS**, *or*
  - keep it out of the repo (`.gitignore`) + a `scripts/fetch-model.*` that
    downloads it into `src-tauri/models/` during setup.
- **Installer impact:** bundling adds ~400 MB to the `.msi`/`.dmg`. Acceptable
  for an offline product; note it in release docs. (Optional future: ship a
  small stub and download the model on first run — but that breaks
  "works offline on day one", so keep bundling as the default.)

---

## 4. Rust module layout (`src-tauri/src/`)

Mirrors the original handover design:

| File | Responsibility |
| --- | --- |
| `state.rs` | `AppState { remover: BgRemover, settings: Mutex<AppSettings> }`, `manage()`d once. |
| `model_manager.rs` | Resolve + verify the bundled model path (exists, non-empty). |
| `bg_remover.rs` | Owns the `ort::Session`. `new(path)` (load once), `remove_background(DynamicImage) -> RgbaImage`. |
| `image_ops.rs` | `preprocess`, `resize_mask`, `composite_rgba`, `save_png`, `save_jpg`. |
| `commands.rs` | Tauri commands (below). |
| `lib.rs` | Build ONNX session at startup → `manage(AppState)` → `invoke_handler![...]` + plugins. |

**Load the model once.** Create the `Session` at startup and keep it in
`AppState` for the whole app lifetime — never per image.

### Commands (`#[tauri::command]`)

```rust
check_model_ready() -> bool
process_image(input_path: String, format: "png" | "jpg") -> String   // returns output path
batch_process(paths: Vec<String>, out_dir: String) -> Vec<String>    // Phase 4
get_settings() / set_settings(...)                                   // Phase 4
```

---

## 5. Inference pipeline (`bg_remover::remove_background`)

1. **Load** original image (`image` crate), remember original W×H.
2. **Preprocess** (`image_ops::preprocess`): resize to 1024×1024 (Lanczos3 via
   `fast_image_resize`), convert to `f32` in `[0,1]`, per-channel normalize
   (ImageNet stats — confirmed in §1), pack into NCHW `ndarray` `[1,3,1024,1024]`.
   Cast to `f16` if §1 says the input is float16.
3. **Infer:** feed the tensor to the `ort::Session`, read output
   `[1,1,1024,1024]`. Cast f16→f32 if needed. Apply sigmoid only if not in-graph.
4. **Postprocess:** resize the 1024² matte back to original W×H (bilinear),
   optionally threshold/feather edges, build an `RgbaImage` = original RGB +
   matte as the alpha channel.
5. **Save:** PNG keeps alpha; JPG flattens onto white (matches the web export
   rules). **Never overwrite the original** — write `<name>_nobg.<ext>`.

---

## 6. Concurrency, progress & cancellation

- Run steps 1–5 inside `tauri::async_runtime::spawn_blocking` so the WebView
  thread never blocks.
- Stream progress with `AppHandle::emit("process-progress", Payload)` where the
  payload carries `{ stage, percent }` — one event per stage
  (`load` → `preprocess` → `infer` → `export`) so the existing
  `ProcessingScreen` stages light up for real.
- Cancellation: hold an `AtomicBool` per job in `AppState`; the `Cancel` button
  invokes a `cancel_processing` command that flips it; the pipeline checks it
  between stages and cleans up any temp output.

---

## 7. Frontend integration

Keep the store/UI; swap the engine.

- **New hook `useRemoval()`** (replaces `useSimulatedRemoval`): on mount for a
  `processing` job, `invoke("process_image", { inputPath, format })` and
  `listen("process-progress", …)` (`@tauri-apps/api/event`) to drive
  `setProgress` / `setStage`. On resolve → `finish({ url, … })`.
- **File paths (the key plumbing change):** the Rust command needs an OS path,
  but the browser `DropZone` only yields a `File`. Two inputs:
  - **Picker:** `@tauri-apps/plugin-dialog` `open()` → returns an absolute path.
  - **Drag-drop:** in Tauri, listen to `getCurrentWebview().onDragDropEvent()`
    (payload has `paths`). This means re-enabling Tauri's drag handler
    (`"dragDropEnabled": true` in `tauri.conf.json`) and branching: Tauri path
    events in the app, DOM `onDrop` in the browser preview.
  - Display the result with `convertFileSrc(outputPath)`.
- **Export/Copy:** `ResultScreen` save buttons call `plugin-dialog` `save()` for
  the location; copy uses `@tauri-apps/plugin-clipboard-manager`.
- **Keep the browser preview working:** guard on `isTauri()` (already used in
  `window-controls.ts`) — in a plain `pnpm dev` browser, fall back to
  `useSimulatedRemoval` + the current canvas export. So `pnpm dev` stays a fast
  UI loop and `tauri:dev` runs real inference.

---

## 8. GPU acceleration (compile-time opt-in)

- Ship **CPU-only by default** (already the plan). Enable a provider per build:
  `pnpm tauri:build --features directml` (Windows), `coreml` (macOS), `cuda`.
- In `bg_remover::new`, register providers in priority order with **CPU
  fallback**, so a GPU build still runs if the provider is unavailable.

---

## 9. Error handling → UI states

Map Rust `Err` to the frontend (matches the handover error table):

| Failure | Rust | UI |
| --- | --- | --- |
| Unsupported file | `Err("Unsupported format")` | shake DropZone / toast |
| Image > ~100 MP | `Err("Image too large")` | "Try resizing first" |
| Inference OOM/panic | catch → `Err("Processing failed")` | "Try a smaller image" |
| Model missing/corrupt | startup `check_model_ready=false` | blocking "Reinstall required" |
| Disk full on save | IO error | "Save failed — disk full?" |

**Performance targets** (from handover): cold model load < 3 s; single 1080p on
CPU < 10 s; GPU < 3 s; peak memory < 600 MB.

---

## 10. Phased rollout

- **Phase 1 — Rust engine (CPU, path in/out).** §1 verify, add deps, place
  model, `model_manager` + `bg_remover` + `image_ops`, `process_image` +
  `check_model_ready`. Validate against a test image via a throwaway CLI/test
  before touching the UI.
- **Phase 2 — Frontend wiring.** `useRemoval` hook, progress events, dialog
  picker + Tauri drag-drop paths, `convertFileSrc` display, export/copy via
  plugins, `isTauri()` fallback to simulation in the browser.
- **Phase 3 — GPU providers.** Feature flags + provider fallback; measure
  against targets.
- **Phase 4 — Batch, settings, polish.** `batch_process` (sequential, bounded
  memory), settings persistence, EXIF handling, temp-file cleanup on
  cancel/error.

---

## 11. Verification checklist

- [ ] Model loads on cold start (< 3 s); `check_model_ready` true.
- [ ] Single image → transparent PNG with a real alpha channel (verify in an
      editor), matte matches subject edges (hair/soft detail).
- [ ] Normalization confirmed correct (no inverted/noisy masks).
- [ ] JPG export = white background, no transparency.
- [ ] Cancel mid-inference → no crash, no orphan temp files.
- [ ] Batch of 10 → sequential, memory stays < 600 MB (no leak per image).
- [ ] Runs fully offline (disconnect network, confirm).
- [ ] `pnpm dev` (browser) still works via the simulated fallback.
```
