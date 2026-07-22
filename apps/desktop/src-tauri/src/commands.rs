//! Tauri commands exposed to the frontend.

use serde::Serialize;
use std::path::Path;
use tauri::{AppHandle, Emitter, State};

use crate::image_ops;
use crate::state::AppState;

#[derive(Serialize, Clone)]
struct Progress {
    stage: String,
    percent: u8,
}

fn emit(app: &AppHandle, stage: &str, percent: u8) {
    let _ = app.emit(
        "process-progress",
        Progress {
            stage: stage.to_string(),
            percent,
        },
    );
}

/// True once the model is loaded and ready to serve requests.
#[tauri::command]
pub fn check_model_ready(state: State<AppState>) -> bool {
    state.remover.lock().map(|g| g.is_some()).unwrap_or(false)
}

/// Remove the background from `input_path`, writing `<name>_nobg.<png|jpg>`
/// next to it. Returns the output path. Streams `process-progress` events so
/// the existing ProcessingScreen stages light up for real.
///
/// Runs synchronously — Tauri executes commands off the WebView thread, so the
/// heavy inference doesn't block the UI.
#[tauri::command]
pub fn process_image(
    app: AppHandle,
    state: State<AppState>,
    input_path: String,
    format: String,
) -> Result<String, String> {
    emit(&app, "load", 5);
    let mut guard = state
        .remover
        .lock()
        .map_err(|_| "inference engine is busy".to_string())?;
    let remover = guard.as_mut().ok_or_else(|| "Model not ready".to_string())?;

    emit(&app, "preprocess", 25);
    let img = image::open(&input_path).map_err(|e| format!("Unsupported image: {e}"))?;
    let (w, h) = image::GenericImageView::dimensions(&img);
    if (w as u64) * (h as u64) > 100_000_000 {
        return Err("Image too large".to_string());
    }

    emit(&app, "infer", 55);
    let result = remover.remove_background(&img)?;

    emit(&app, "export", 90);
    let in_path = Path::new(&input_path);
    let stem = in_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("image");
    let dir = in_path.parent().unwrap_or_else(|| Path::new("."));
    let is_jpg = format.eq_ignore_ascii_case("jpg") || format.eq_ignore_ascii_case("jpeg");
    let ext = if is_jpg { "jpg" } else { "png" };
    let out = dir.join(format!("{stem}_nobg.{ext}"));

    if is_jpg {
        image_ops::save_jpg(&result, &out)?;
    } else {
        image_ops::save_png(&result, &out)?;
    }
    emit(&app, "export", 100);

    Ok(out.to_string_lossy().to_string())
}
