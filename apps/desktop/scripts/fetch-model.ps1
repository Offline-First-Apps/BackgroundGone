# Downloads the ormbg background-removal model into src-tauri/models/.
# The weights are too large for git — fetch them here after cloning.
$ErrorActionPreference = "Stop"

$dir = Join-Path $PSScriptRoot "..\src-tauri\models"
$url = "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_fp16.onnx"

New-Item -ItemType Directory -Force -Path $dir | Out-Null
Write-Host "Downloading model_fp16.onnx -> $dir"
Invoke-WebRequest -Uri $url -OutFile (Join-Path $dir "model_fp16.onnx")
Write-Host "Done."
