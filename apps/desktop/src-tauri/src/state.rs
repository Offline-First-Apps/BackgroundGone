//! Shared app state: the loaded inference engine, held for the app lifetime.
//! `None` when the model failed to load (→ `check_model_ready` is false).

use std::sync::Mutex;

use crate::bg_remover::BgRemover;

pub struct AppState {
    pub remover: Mutex<Option<BgRemover>>,
}
