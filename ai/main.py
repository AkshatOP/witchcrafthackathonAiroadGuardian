from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from inference import run_inference, load_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
        print("YOLOv8 model loaded successfully")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")
        print("Service will start but /detect will fail until model is downloaded.")
    yield


app = FastAPI(
    title="AI Road Guardian — Detection Service",
    description="YOLOv8-based pothole detection microservice",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    confidence: float
    class_name: str
    bbox: BoundingBox


class DetectionResponse(BaseModel):
    detected: bool
    detection_count: int
    confidence: float
    severity: str
    bounding_boxes: list[Detection]
    processing_time_s: float
    image_size: dict
    fallback: Optional[bool] = False



@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-road-guardian-detection"}


@app.post("/detect", response_model=DetectionResponse)
async def detect(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    try:
        result = run_inference(image_bytes)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
