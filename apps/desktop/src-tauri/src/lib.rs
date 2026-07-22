// Tauri application entry point. Kept as a `lib` so a mobile target can call
// `run()` later. Background-removal commands (process_image, batch_process,
// check_model_ready, get_settings, …) will be registered here once the Rust
// ONNX engine lands; the frontend runs against a simulated pipeline until then.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
