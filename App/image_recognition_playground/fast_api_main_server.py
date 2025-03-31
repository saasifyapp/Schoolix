import cv2
import numpy as np
import insightface
import torch
import logging
import os
import base64
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from concurrent.futures import ThreadPoolExecutor

# Suppress logs
logging.getLogger("insightface").setLevel(logging.ERROR)
cv2.setLogLevel(0)
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"

# Check for GPU
ctx_id = 0 if torch.cuda.is_available() else -1  # Use GPU if available

# Load a faster model
face_model = insightface.app.FaceAnalysis(name='buffalo_l')  # Faster model
face_model.prepare(ctx_id=ctx_id)

app = FastAPI()

class ImageData(BaseModel):
    images: List[str]  # Expecting a list of base64 strings

def decode_base64_to_image(base64_string):
    """Decodes base64 string to OpenCV image."""
    try:
        # Remove base64 header if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)
        image_array = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None or img.size == 0:
            print("Error: Decoded image is empty.")
            return None

        return cv2.resize(img, (640, 640))  # Resize for consistency
    except Exception as e:
        print("Error decoding image:", e)
        return None

def detect_gender_from_base64(base64_string):
    """Decodes base64 image and detects gender."""
    img = decode_base64_to_image(base64_string)

    if img is None:
        return "Error: Unable to process image"

    # Debugging: Save the image to check if it's correctly decoded
    cv2.imwrite("debug_decoded.jpg", img)
    print("Saved decoded image for verification.")

    faces = face_model.get(img)

    if not faces:
        return "No face detected"

    return "Male" if faces[0].gender == 1 else "Female"

@app.post("/detect-gender")
async def detect_gender(data: ImageData):
    """Receives base64 images, predicts gender, and returns results."""
    
    # Debugging - Print first few characters of base64 string
    print("Sample base64 input:", data.images[0][:100])  

    with ThreadPoolExecutor() as executor:
        results = list(executor.map(detect_gender_from_base64, data.images))

    return {"genders": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
