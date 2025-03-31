import cv2
import numpy as np
import insightface
import torch
import logging
import os
from concurrent.futures import ThreadPoolExecutor

# Suppress logs
logging.getLogger("insightface").setLevel(logging.ERROR)
cv2.setLogLevel(0)  # Corrected line
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"

# Check for GPU
ctx_id = 0 if torch.cuda.is_available() else -1  # Use GPU if available

# Load a faster model
face_model = insightface.app.FaceAnalysis(name='buffalo_l')  # Faster model
face_model.prepare(ctx_id=ctx_id)

def detect_gender(image_path):
    img = cv2.imread(image_path)

    if img is None:
        print(f"Error: Unable to read image '{image_path}'")
        return None

    img = cv2.resize(img, (640, 640))  # Resize for speed

    faces = face_model.get(img)

    if not faces:
        print(f"No face detected in '{image_path}'.")
        return None

    return "Male" if faces[0].gender == 1 else "Female"

# Process multiple images in parallel
image_paths = [
    "/content/1.jpg",
    "/content/2.jpg"
]

with ThreadPoolExecutor() as executor:
    results = list(executor.map(detect_gender, image_paths))

for path, gender in zip(image_paths, results):
    print(f"Gender for {path}: {gender}")
