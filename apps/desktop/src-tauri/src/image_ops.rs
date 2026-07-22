//! Pre/post-processing for the ormbg (IS-Net) matting model.
//!
//! Contract (from the model's `preprocessor_config.json`):
//!   - resize to 1024×1024, bilinear (`resample: 2`)
//!   - rescale ×1/255 → [0,1]  (NO mean/std — `do_normalize: false`)
//!   - NCHW float32 input `pixel_values` [1,3,1024,1024]
//! Output `alphas` [1,1,1024,1024] is a coarse matte; postprocess is the
//! IS-Net standard: resize to the original size + per-image min-max normalize,
//! then use as the alpha channel.

use image::{imageops::FilterType, DynamicImage, GenericImageView, GrayImage, RgbaImage};
use std::path::Path;

pub const SIZE: u32 = 1024;

/// Resize → /255 → NCHW `Vec<f32>` of length 3*1024*1024.
pub fn preprocess(img: &DynamicImage) -> Vec<f32> {
    let resized = img.resize_exact(SIZE, SIZE, FilterType::Triangle).to_rgb8();
    let plane = (SIZE * SIZE) as usize;
    let mut data = vec![0f32; 3 * plane];
    for (x, y, px) in resized.enumerate_pixels() {
        let idx = (y * SIZE + x) as usize;
        data[idx] = px[0] as f32 / 255.0; // R plane
        data[plane + idx] = px[1] as f32 / 255.0; // G plane
        data[2 * plane + idx] = px[2] as f32 / 255.0; // B plane
    }
    data
}

/// Min-max normalize the 1024² matte, resize it back to the original
/// dimensions, and composite it as the alpha channel over the original RGB.
pub fn composite_rgba(mask: &[f32], original: &DynamicImage) -> RgbaImage {
    let (mut mi, mut ma) = (f32::MAX, f32::MIN);
    for &v in mask {
        if v < mi {
            mi = v;
        }
        if v > ma {
            ma = v;
        }
    }
    let range = (ma - mi).max(1e-6);

    let mut gray = GrayImage::new(SIZE, SIZE);
    for (i, &v) in mask.iter().enumerate() {
        let a = (((v - mi) / range) * 255.0).round().clamp(0.0, 255.0) as u8;
        let x = (i as u32) % SIZE;
        let y = (i as u32) / SIZE;
        gray.put_pixel(x, y, image::Luma([a]));
    }

    let (ow, oh) = original.dimensions();
    let alpha = image::imageops::resize(&gray, ow, oh, FilterType::Triangle);
    let rgb = original.to_rgba8();
    let mut out = RgbaImage::new(ow, oh);
    for (x, y, p) in rgb.enumerate_pixels() {
        let a = alpha.get_pixel(x, y)[0];
        out.put_pixel(x, y, image::Rgba([p[0], p[1], p[2], a]));
    }
    out
}

pub fn save_png(img: &RgbaImage, path: &Path) -> Result<(), String> {
    img.save(path).map_err(|e| e.to_string())
}

/// JPG has no alpha — flatten onto white (matches the web export rules).
pub fn save_jpg(img: &RgbaImage, path: &Path) -> Result<(), String> {
    let mut rgb = image::RgbImage::new(img.width(), img.height());
    for (x, y, p) in img.enumerate_pixels() {
        let a = p[3] as f32 / 255.0;
        let blend = |c: u8| ((c as f32 * a) + (255.0 * (1.0 - a))).round() as u8;
        rgb.put_pixel(x, y, image::Rgb([blend(p[0]), blend(p[1]), blend(p[2])]));
    }
    image::DynamicImage::ImageRgb8(rgb)
        .save(path)
        .map_err(|e| e.to_string())
}
