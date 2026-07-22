//! Resolve the bundled model path — from Tauri resources in a packaged app,
//! or from `src-tauri/models/` during `tauri dev`.

use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub const MODEL_FILE: &str = "models/model_fp16.onnx";

pub fn resolve_model_path(app: &AppHandle) -> Result<PathBuf, String> {
    // Packaged: resolved out of the app's Resource dir.
    if let Ok(p) = app
        .path()
        .resolve(MODEL_FILE, tauri::path::BaseDirectory::Resource)
    {
        if p.exists() {
            return Ok(p);
        }
    }
    // Dev fallback: next to the crate.
    let dev = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(MODEL_FILE);
    if dev.exists() {
        return Ok(dev);
    }
    Err(format!(
        "model not found (looked in Resource dir and {})",
        dev.display()
    ))
}
