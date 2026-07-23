//! Tauri commands exposed to the frontend.

use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::image_ops;
use crate::settings::{self, AppSettings};
use crate::state::AppState;

#[derive(Serialize, Clone)]
struct Progress {
    stage: String,
    percent: u8,
}

#[derive(Serialize)]
pub struct ImageInfo {
    width: u32,
    height: u32,
    size: u64,
}

#[derive(Serialize)]
pub struct EngineInfo {
    /// Compiled execution provider label.
    provider: String,
    /// Whether a GPU provider is compiled in.
    gpu: bool,
    ready: bool,
}

const ACCEPT_EXTS: [&str; 4] = ["png", "jpg", "jpeg", "webp"];

fn emit(app: &AppHandle, stage: &str, percent: u8) {
    let _ = app.emit(
        "process-progress",
        Progress {
            stage: stage.to_string(),
            percent,
        },
    );
}

fn ext_is_jpg(format: &str) -> bool {
    format.eq_ignore_ascii_case("jpg") || format.eq_ignore_ascii_case("jpeg")
}

fn is_image(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| ACCEPT_EXTS.iter().any(|a| a.eq_ignore_ascii_case(e)))
        .unwrap_or(false)
}

/// `<out_dir | source_dir>/<stem><suffix>.<format>`
fn output_path(input: &str, s: &AppSettings) -> PathBuf {
    let p = Path::new(input);
    let stem = p.file_stem().and_then(|x| x.to_str()).unwrap_or("image");
    let ext = if ext_is_jpg(&s.format) { "jpg" } else { "png" };
    let dir = match &s.output_dir {
        Some(d) if !d.is_empty() => PathBuf::from(d),
        _ => p
            .parent()
            .map(|x| x.to_path_buf())
            .unwrap_or_else(|| PathBuf::from(".")),
    };
    dir.join(format!("{stem}{}.{ext}", s.suffix))
}

#[tauri::command]
pub fn check_model_ready(state: State<AppState>) -> bool {
    state.remover.lock().map(|g| g.is_some()).unwrap_or(false)
}

#[tauri::command]
pub fn engine_info(state: State<AppState>) -> EngineInfo {
    let provider = if cfg!(feature = "directml") {
        "DirectML"
    } else if cfg!(feature = "coreml") {
        "CoreML"
    } else if cfg!(feature = "cuda") {
        "CUDA"
    } else {
        "CPU"
    };
    EngineInfo {
        provider: provider.to_string(),
        gpu: provider != "CPU",
        ready: state.remover.lock().map(|g| g.is_some()).unwrap_or(false),
    }
}

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

/// Expand a drop/selection: directories become their contained images; image
/// files pass through; anything else is dropped. Used for folder → batch.
#[tauri::command]
pub fn expand_paths(paths: Vec<String>) -> Vec<String> {
    let mut out = Vec::new();
    for p in paths {
        let path = Path::new(&p);
        if path.is_dir() {
            if let Ok(rd) = std::fs::read_dir(path) {
                let mut files: Vec<String> = rd
                    .flatten()
                    .map(|e| e.path())
                    .filter(|pp| is_image(pp))
                    .map(|pp| pp.to_string_lossy().to_string())
                    .collect();
                files.sort();
                out.extend(files);
            }
        } else if is_image(path) {
            out.push(p);
        }
    }
    out
}

#[tauri::command]
pub fn cancel_processing(state: State<AppState>) {
    state.cancel.store(true, Ordering::SeqCst);
}

#[tauri::command]
pub fn get_settings(state: State<AppState>) -> AppSettings {
    state
        .settings
        .lock()
        .map(|s| s.clone())
        .unwrap_or_default()
}

#[tauri::command]
pub fn set_settings(
    app: AppHandle,
    state: State<AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    if let Ok(mut guard) = state.settings.lock() {
        *guard = settings.clone();
    }
    settings::save(&app, &settings)
}

/// Remove the background from one image, writing the output per current
/// settings. Streams `process-progress`; abortable via `cancel_processing`.
#[tauri::command]
pub fn process_image(
    app: AppHandle,
    state: State<AppState>,
    input_path: String,
) -> Result<String, String> {
    state.cancel.store(false, Ordering::SeqCst);
    let settings = state.settings.lock().map(|s| s.clone()).unwrap_or_default();

    emit(&app, "load", 5);
    let mut guard = state
        .remover
        .lock()
        .map_err(|_| "inference engine is busy".to_string())?;
    let remover = guard.as_mut().ok_or_else(|| "Model not ready".to_string())?;
    if state.cancel.load(Ordering::SeqCst) {
        return Err("cancelled".to_string());
    }

    emit(&app, "preprocess", 25);
    let img = image::open(&input_path).map_err(|e| format!("Unsupported image: {e}"))?;
    let (w, h) = image::GenericImageView::dimensions(&img);
    if (w as u64) * (h as u64) > 100_000_000 {
        return Err("Image too large".to_string());
    }
    if state.cancel.load(Ordering::SeqCst) {
        return Err("cancelled".to_string());
    }

    emit(&app, "infer", 55);
    let result = remover.remove_background(&img)?;
    if state.cancel.load(Ordering::SeqCst) {
        return Err("cancelled".to_string());
    }

    emit(&app, "export", 90);
    let out = output_path(&input_path, &settings);
    if ext_is_jpg(&settings.format) {
        image_ops::save_jpg(&result, &out)?;
    } else {
        image_ops::save_png(&result, &out)?;
    }
    emit(&app, "export", 100);
    Ok(out.to_string_lossy().to_string())
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
