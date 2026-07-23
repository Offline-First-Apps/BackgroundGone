//! Shared app state: the loaded inference engine, user settings, and a cancel
//! flag checked between pipeline stages.

use std::sync::atomic::AtomicBool;
use std::sync::Mutex;

use crate::bg_remover::BgRemover;
use crate::settings::AppSettings;

pub struct AppState {
    /// `None` when the model failed to load (→ `check_model_ready` is false).
    pub remover: Mutex<Option<BgRemover>>,
    pub settings: Mutex<AppSettings>,
    /// Set by `cancel_processing`, checked between stages, reset per job.
    pub cancel: AtomicBool,
}
