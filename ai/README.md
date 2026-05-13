# 🧠 AI Module - Urban Resilience Intelligence

Welcome to the brains of the Smart City platform. This directory houses our Artificial Intelligence inference engine, built specifically to analyze urban environments and detect anomalies that impact city resilience.

## 🎯 Overview

To achieve true "Smart City" efficiency, human visual inspection is not scalable. This AI module ingests images (such as street camera feeds or citizen-uploaded photos) and runs state-of-the-art computer vision models to identify critical infrastructure issues—most notably, potholes, road degradation, and other urban hazards. The insights generated are passed back to the backend and ultimately plotted on the frontend dashboard.

## ⚙️ Tech Stack & Models

- **Language:** Python 3.9+
- **Core Framework:** [PyTorch](https://pytorch.org/)
- **Model Architecture:** [YOLOv8 by Ultralytics](https://github.com/ultralytics/ultralytics) - Chosen for its exceptional balance of real-time speed and detection accuracy.
- **Pre-trained Weights:** We utilize `yolov8n.pt` (YOLOv8 Nano) as our base, fine-tuned/adapted for urban object detection.

## ✨ Core Features

- **Real-Time Object Detection:** Capable of processing images rapidly to identify bounding boxes and confidence scores for specific infrastructure defects.
- **REST Integration:** Wraps the inference logic in a lightweight Python web server (e.g., Flask/FastAPI) to easily accept image payloads from the Node.js backend.
- **Scalable Pipeline:** Designed so that heavier models (YOLOv8s, YOLOv8m) can be swapped in if more computational power is available.

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9 or higher.
- (Optional but recommended) A dedicated GPU with CUDA support for faster inference.

### 1. Create a Virtual Environment
It is highly recommended to isolate your Python dependencies.
```bash
cd ai
python -m venv .venv
```

**Activate the environment:**
- On Windows:
  ```bash
  .venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source .venv/bin/activate
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Model Weights
Ensure that the YOLOv8 weights file (`yolov8n.pt`) is present in the root of the `ai` directory. If it is missing, running the main inference script will typically download the base nano model automatically from the Ultralytics repository.

### 4. Run the Inference Server
Start the AI service to begin listening for image processing requests from the backend:
```bash
python main.py
```
*(Check your console output for the exact port the Python server binds to, usually `8000` or `5000`.)*

## 📁 Directory Structure Overview
- `/inference`: Core scripts handling image loading, tensor conversion, and model execution.
- `/models`: Storage for compiled/fine-tuned model weights.
- `/datasets`: (If applicable) Used for training or validation datasets.
- `main.py`: The entry point that spins up the web server and loads the YOLOv8 model into memory.
