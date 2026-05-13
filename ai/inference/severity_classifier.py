"""
Severity classification logic.
Input: list of YOLO detections (each has confidence score)
Output: 'low' | 'medium' | 'severe'

Classification table:
| Max Confidence | Detection Count | Severity |
|----------------|-----------------|----------|
| < 0.5          | any             | low      |
| 0.5 – 0.75     | 1–2             | medium   |
| > 0.75         | any             | severe   |
| any            | 3+              | severe   |
"""

def classify_severity(detections: list[dict]) -> str:
    if not detections:
        return "low"

    count = len(detections)
    max_conf = max(d["confidence"] for d in detections)

    if count >= 3:
        return "severe"
    if max_conf > 0.75:
        return "severe"
    if max_conf >= 0.5:
        return "medium"
    return "low"
