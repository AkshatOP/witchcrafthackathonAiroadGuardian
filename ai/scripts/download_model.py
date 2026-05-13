"""
Downloads YOLOv8n pretrained weights to ai/models/.
Run from the ai/ directory: python scripts/download_model.py
"""
import os
from pathlib import Path
from ultralytics import YOLO

MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

MODEL_NAME = "yolov8n.pt"
TARGET_PATH = MODELS_DIR / MODEL_NAME

if TARGET_PATH.exists():
    print(f"Model already exists at {TARGET_PATH}")
else:
    print(f"Downloading {MODEL_NAME}...")
    model = YOLO(MODEL_NAME)  # downloads to ~/.cache/ultralytics on first call
    # Copy from ultralytics cache to our models dir
    import shutil
    cache_path = Path.home() / ".cache" / "ultralytics" / MODEL_NAME
    if cache_path.exists():
        shutil.copy(cache_path, TARGET_PATH)
    else:
        model.save(str(TARGET_PATH))
    print(f"Model saved to {TARGET_PATH}")

print("Done. To use a fine-tuned pothole model, replace yolov8n.pt with your weights.")
