//! Tauri commands exposed to the frontend.

use serde::Serialize;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::image_ops;
use crate::state::AppState;

#[derive(Serialize, Clone)]
struct Progress {
    stage: String,
    percent: u8,
}

#[derive(Serialize, Clone)]
struct BatchProgress {
    index: usize,
    total: usize,
    percent: u8,
}

#[derive(Serialize)]
pub struct ImageInfo {
    width: u32,
    height: u32,
    size: u64,
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

/// Derive `<dir>/<stem>_nobg.<ext>` next to the input.
fn output_path(input: &str, ext: &str) -> PathBuf {
    let p = Path::new(input);
    let stem = p.file_stem().and_then(|s| s.to_str()).unwrap_or("image");
    let dir = p.parent().unwrap_or_else(|| Path::new("."));
    dir.join(format!("{stem}_nobg.{ext}"))
}

fn ext_is_jpg(format: &str) -> bool {
    format.eq_ignore_ascii_case("jpg") || format.eq_ignore_ascii_case("jpeg")
}

/// Run the full pipeline on one already-open image and write the output file.
fn run_one(
    remover: &mut crate::bg_remover::BgRemover,
    input_path: &str,
    format: &str,
) -> Result<String, String> {
    let img = image::open(input_path).map_err(|e| format!("Unsupported image: {e}"))?;
    let (w, h) = image::GenericImageView::dimensions(&img);
    if (w as u64) * (h as u64) > 100_000_000 {
        return Err("Image too large".to_string());
    }
    let result = remover.remove_background(&img)?;
    let is_jpg = ext_is_jpg(format);
    let out = output_path(input_path, if is_jpg { "jpg" } else { "png" });
    if is_jpg {
        image_ops::save_jpg(&result, &out)?;
    } else {
        image_ops::save_png(&result, &out)?;
    }
    Ok(out.to_string_lossy().to_string())
}

/// True once the model is loaded and ready to serve requests.
#[tauri::command]
pub fn check_model_ready(state: State<AppState>) -> bool {
    state.remover.lock().map(|g| g.is_some()).unwrap_or(false)
}

/// Intrinsic dimensions + file size, without loading pixels into the WebView.
#[tauri::command]
pub fn image_info(path: String) -> Result<ImageInfo, String> {
    let (width, height) =
        image::image_dimensions(&path).map_err(|e| format!("read image: {e}"))?;
    let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
    Ok(ImageInfo {
        width,
        height,
        size,
    })
}

/// Remove the background from a single image, streaming `process-progress`
/// events so the ProcessingScreen stages light up for real.
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
    emit(&app, "infer", 55);
    let out = run_one(remover, &input_path, &format)?;
    emit(&app, "export", 100);
    Ok(out)
}

/// Process a folder/selection sequentially, emitting `batch-progress`. Memory
/// stays bounded — one image in flight at a time.
#[tauri::command]
pub fn batch_process(
    app: AppHandle,
    state: State<AppState>,
    paths: Vec<String>,
    format: String,
) -> Result<Vec<String>, String> {
    let mut guard = state
        .remover
        .lock()
        .map_err(|_| "inference engine is busy".to_string())?;
    let remover = guard.as_mut().ok_or_else(|| "Model not ready".to_string())?;

    let total = paths.len();
    let mut outputs = Vec::with_capacity(total);
    for (index, input) in paths.iter().enumerate() {
        let _ = app.emit(
            "batch-progress",
            BatchProgress {
                index,
                total,
                percent: 0,
            },
        );
        match run_one(remover, input, &format) {
            Ok(out) => outputs.push(out),
            Err(e) => eprintln!("[batch] {input}: {e}"),
        }
        let _ = app.emit(
            "batch-progress",
            BatchProgress {
                index,
                total,
                percent: 100,
            },
        );
    }
    Ok(outputs)
}

/// Save an already-produced result to a user-chosen path. PNG keeps alpha; a
/// `.jpg`/`.jpeg` destination flattens onto white.
#[tauri::command]
pub fn export_result(src_path: String, dest_path: String) -> Result<(), String> {
    let img = image::open(&src_path)
        .map_err(|e| e.to_string())?
        .to_rgba8();
    let dest = Path::new(&dest_path);
    let is_jpg = dest
        .extension()
        .and_then(|e| e.to_str())
        .map(ext_is_jpg)
        .unwrap_or(false);
    if is_jpg {
        image_ops::save_jpg(&img, dest)
    } else {
        image_ops::save_png(&img, dest)
    }
}

/// Copy the result image to the system clipboard.
#[tauri::command]
pub fn copy_result(app: AppHandle, src_path: String) -> Result<(), String> {
    let img = image::open(&src_path)
        .map_err(|e| e.to_string())?
        .to_rgba8();
    let (w, h) = (img.width(), img.height());
    let tauri_img = tauri::image::Image::new_owned(img.into_raw(), w, h);
    app.clipboard()
        .write_image(&tauri_img)
        .map_err(|e| e.to_string())
}
