import os
import time
from pathlib import Path
from PIL import Image
import io

from ultralytics import YOLO
from .severity_classifier import classify_severity

MODEL_PATH = os.getenv("MODEL_PATH", "./models/pothole_yolov8s.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "1280"))

# Named pothole class labels used by multi-class models
POTHOLE_CLASS_NAMES = {"pothole", "pot hole", "road damage", "crack", "potholes"}

_model: YOLO | None = None


def load_model() -> YOLO:
    global _model
    if _model is None:
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run: python ai/scripts/download_model.py"
            )
        _model = YOLO(str(model_path))
    return _model


def run_inference(image_bytes: bytes) -> dict:
    start = time.time()
    model = load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Resize if too large (keeps aspect ratio)
    w, h = image.size
    if max(w, h) > MAX_IMAGE_SIZE:
        scale = MAX_IMAGE_SIZE / max(w, h)
        image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    results = model(image, conf=CONFIDENCE_THRESHOLD, verbose=False)
    elapsed = round(time.time() - start, 3)

    detections = _parse_results(results, image.size)
    severity = classify_severity(detections)
    max_conf = max((d["confidence"] for d in detections), default=0.0)

    return {
        "detected": len(detections) > 0,
        "detection_count": len(detections),
        "confidence": round(max_conf, 4),
        "severity": severity,
        "bounding_boxes": detections,
        "processing_time_s": elapsed,
        "image_size": {"width": image.size[0], "height": image.size[1]},
    }


def _parse_results(results, image_size: tuple) -> list[dict]:
    w, h = image_size
    detections = []

    for result in results:
        if result.boxes is None:
            continue

        # Single-class model: every detection is a pothole by definition.
        # Multi-class model (e.g. COCO): filter by known pothole class names only.
        is_single_class_model = len(result.names) == 1

        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = result.names.get(class_id, "unknown").lower()

            if not (is_single_class_model or class_name in POTHOLE_CLASS_NAMES):
                continue

            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "confidence": round(conf, 4),
                "class_name": "pothole",
                "bbox": {
                    "x1": round(x1 / w, 4),
                    "y1": round(y1 / h, 4),
                    "x2": round(x2 / w, 4),
                    "y2": round(y2 / h, 4),
                },
            })

    return detections
