// Tauri application entry point. The ONNX background-removal engine is built
// once at startup and shared via managed state. If the model can't be loaded
// the app still starts and `check_model_ready()` reports false, so the UI can
// show a "reinstall required" notice instead of crashing.

mod bg_remover;
mod commands;
mod image_ops;
mod model_manager;
mod settings;
mod state;

use std::sync::atomic::AtomicBool;
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
            let settings = settings::load(app.handle());
            app.manage(AppState {
                remover: Mutex::new(remover),
                settings: Mutex::new(settings),
                cancel: AtomicBool::new(false),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_model_ready,
            commands::engine_info,
            commands::image_info,
            commands::expand_paths,
            commands::cancel_processing,
            commands::get_settings,
            commands::set_settings,
            commands::process_image,
            commands::export_result,
            commands::copy_result,
            commands::open_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
