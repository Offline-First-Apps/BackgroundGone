// Tauri application entry point. The ONNX background-removal engine is built
// once at startup and shared via managed state. If the model can't be loaded
// the app still starts and `check_model_ready()` reports false, so the UI can
// show a "reinstall required" notice instead of crashing.

mod bg_remover;
mod commands;
mod image_ops;
mod model_manager;
mod state;

use std::sync::Mutex;

use tauri::Manager;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let remover = match model_manager::resolve_model_path(app.handle()) {
                Ok(path) => match bg_remover::BgRemover::new(&path) {
                    Ok(r) => {
                        println!("[bg] model loaded from {}", path.display());
                        Some(r)
                    }
                    Err(e) => {
                        eprintln!("[bg] failed to load model: {e}");
                        None
                    }
                },
                Err(e) => {
                    eprintln!("[bg] {e}");
                    None
                }
            };
            app.manage(AppState {
                remover: Mutex::new(remover),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_model_ready,
            commands::image_info,
            commands::process_image,
            commands::batch_process,
            commands::export_result,
            commands::copy_result
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
