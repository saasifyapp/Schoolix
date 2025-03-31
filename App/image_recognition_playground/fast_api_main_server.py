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
ctx_id = 0 if torch.cuda.is_available() else -1

# Load model
face_model = insightface.app.FaceAnalysis(name='buffalo_l')
face_model.prepare(ctx_id=ctx_id)

app = FastAPI()

class ImageData(BaseModel):
    images: List[str]  # List of base64 strings

def decode_base64_to_image(base64_string):
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

        return cv2.resize(img, (640, 640)) if img is not None else None
    except Exception:
        return None

def extract_embedding(base64_string):
    img = decode_base64_to_image(base64_string)
    if img is None:
        return None

    faces = face_model.get(img)
    if not faces:
        return None

    embedding = faces[0].embedding.tolist()

    # Log the count of the embedding
    print(f"📌 Embedding Count: {len(embedding)}")  # This will log the count of the embedding

    return embedding

@app.post("/extract-embedding")
async def extract_embeddings(data: ImageData):
    with ThreadPoolExecutor() as executor:
        embeddings = list(filter(None, executor.map(extract_embedding, data.images)))

    return {"embeddings": embeddings[:5]}  # Return only 5 embeddings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
