//! User settings, persisted as JSON in the app config directory.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// "png" | "jpg" — default one-click / batch output format.
    pub format: String,
    /// Output directory; `None` means "same folder as source".
    pub output_dir: Option<String>,
    /// "fast" | "best" — maps to graph optimization level.
    pub quality: String,
    /// User preference for GPU (only effective in a GPU-enabled build).
    pub gpu: bool,
    /// Filename suffix inserted before the extension.
    pub suffix: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            format: "png".into(),
            output_dir: None,
            quality: "best".into(),
            gpu: true,
            suffix: "_nobg".into(),
        }
    }
}

fn settings_path(app: &AppHandle) -> Option<PathBuf> {
    let dir = app.path().app_config_dir().ok()?;
    let _ = std::fs::create_dir_all(&dir);
    Some(dir.join("settings.json"))
}

pub fn load(app: &AppHandle) -> AppSettings {
    settings_path(app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    let path = settings_path(app).ok_or("no config dir")?;
    let json = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}
