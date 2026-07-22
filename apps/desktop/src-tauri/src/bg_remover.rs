//! ONNX Runtime inference engine. Owns the session, loaded once at startup.
//!
//! NOTE: `ort` 2.x API surface (inputs! macro, tensor extraction helpers) has
//! shifted across point releases. If `cargo build` flags a signature here,
//! it's a mechanical fix against the installed `ort` version — the pipeline
//! shape (fp32 NCHW in, fp32 matte out) is fixed.

use image::DynamicImage;
use ort::session::{builder::GraphOptimizationLevel, Session};
use ort::value::Tensor;
use std::path::Path;

use crate::image_ops::{self, SIZE};

pub struct BgRemover {
    session: Session,
}

impl BgRemover {
    pub fn new(model_path: &Path) -> Result<Self, String> {
        let threads = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(4);

        let mut builder = Session::builder()
            .map_err(|e| e.to_string())?
            .with_optimization_level(GraphOptimizationLevel::Level3)
            .map_err(|e| e.to_string())?
            .with_intra_threads(threads)
            .map_err(|e| e.to_string())?;

        // GPU execution providers are compile-time opt-ins (Cargo features).
        // ort registers them with automatic CPU fallback if unavailable.
        #[cfg(feature = "directml")]
        {
            use ort::execution_providers::DirectMLExecutionProvider;
            builder = builder
                .with_execution_providers([DirectMLExecutionProvider::default().build()])
                .map_err(|e| e.to_string())?;
        }
        #[cfg(feature = "coreml")]
        {
            use ort::execution_providers::CoreMLExecutionProvider;
            builder = builder
                .with_execution_providers([CoreMLExecutionProvider::default().build()])
                .map_err(|e| e.to_string())?;
        }
        #[cfg(feature = "cuda")]
        {
            use ort::execution_providers::CUDAExecutionProvider;
            builder = builder
                .with_execution_providers([CUDAExecutionProvider::default().build()])
                .map_err(|e| e.to_string())?;
        }

        let session = builder
            .commit_from_file(model_path)
            .map_err(|e| e.to_string())?;
        Ok(Self { session })
    }

    /// Full pipeline: preprocess → infer → composite RGBA.
    pub fn remove_background(&mut self, img: &DynamicImage) -> Result<image::RgbaImage, String> {
        let pixels = image_ops::preprocess(img);
        let input = Tensor::from_array((
            [1_usize, 3, SIZE as usize, SIZE as usize],
            pixels,
        ))
        .map_err(|e| e.to_string())?;

        let outputs = self
            .session
            .run(ort::inputs!["pixel_values" => input])
            .map_err(|e| e.to_string())?;

        let (_shape, mask) = outputs["alphas"]
            .try_extract_tensor::<f32>()
            .map_err(|e| e.to_string())?;

        Ok(image_ops::composite_rgba(mask, img))
    }
}
