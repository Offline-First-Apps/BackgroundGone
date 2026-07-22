#!/usr/bin/env bash
# Downloads the ormbg background-removal model into src-tauri/models/.
# The weights are too large for git — fetch them here after cloning.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/src-tauri/models"
URL="https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_fp16.onnx"

mkdir -p "$DIR"
echo "Downloading model_fp16.onnx -> $DIR"
curl -L --fail --progress-bar -o "$DIR/model_fp16.onnx" "$URL"
echo "Done ($(du -h "$DIR/model_fp16.onnx" | cut -f1))."
