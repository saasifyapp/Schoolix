import cv2
import numpy as np
import insightface
import torch
import logging
import os
import base64
from fastapi import FastAPI, HTTPException
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

embedding_dimension = 512  # Expected dimension of embeddings

app = FastAPI()

class ImageData(BaseModel):
    images: List[str]  # List of base64 strings

class LiveImageData(BaseModel):
    image: str  # Single base64 image string

class StoredEmbedding(BaseModel):
    user_id: str
    name: str
    section: str
    standard_division: str
    embedding: List[List[float]]  # Ensuring embedding as a list of list of floats

stored_embeddings = []

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
    embedding_shape = np.array(embedding).shape

    # Ensure the embedding has the correct dimension
    if embedding_shape == (embedding_dimension,):
        return embedding
    else:
       # print(f"Skipping embedding with shape: {embedding_shape}")
        return None

def cosine_similarity_np(ref_embedding, img_embedding):
    dot_product = np.dot(ref_embedding, img_embedding)
    norm_product = np.linalg.norm(ref_embedding) * np.linalg.norm(img_embedding)
    similarity = dot_product / norm_product
    confidence = (similarity + 1) / 2 * 100  # Convert to percentage (0-100%)
    return confidence

########### Embedd 5 images while enrolling ############

@app.post("/extract-embedding")
async def extract_embeddings(data: ImageData):
    with ThreadPoolExecutor() as executor:
        embeddings = list(filter(None, executor.map(extract_embedding, data.images)))

   # print(f"Extracted embeddings for enrollment: {len(embeddings)} embeddings")
    for i, emb in enumerate(embeddings[:5]):
        print(f"Embedding {i+1}: {emb[:5]}...")  # Display first 5 values as a sample

    return {"embeddings": embeddings[:5]}  # Return only 5 embeddings

########### Store existing embeddings in object ############

@app.post("/store-retrieve-embeddings")
async def store_embeddings(data: List[StoredEmbedding]):
    try:
        # Clear existing records
        stored_embeddings.clear()
        
        for embedding_data in data:
            for emb in embedding_data.embedding:
                if np.array(emb).shape == (embedding_dimension,):
                    stored_embeddings.append({
                        "user_id": embedding_data.user_id,
                        "name": embedding_data.name,
                        "section": embedding_data.section,
                        "standard_division": embedding_data.standard_division,
                        "embedding": emb,
                    })
        
       # print(f"Stored embeddings: {len(stored_embeddings)} records")
        for i, se in enumerate(stored_embeddings):
            print(f"Stored {i+1}: User ID {se['user_id']} with embedding {se['embedding'][:5]}...")  # Sample of embedding

        return {"message": "Embeddings stored successfully", "count": len(stored_embeddings), "data": stored_embeddings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

############### Embedd live feed from Webcam #########

@app.post("/embedd-live-face")
async def embedd_live_face(data: LiveImageData):
    embedding = extract_embedding(data.image)
    if embedding:
       # print(f"Live feed embedding: {embedding[:5]}...")  # Display first 5 values as a sample
        threshold = 75  # Adjust threshold as needed

        matching_users = []
        match_found = False
        for stored in stored_embeddings:
            confidence = cosine_similarity_np(stored["embedding"], embedding)
            print(f"Comparing with user ID {stored['user_id']}: Confidence {confidence:.2f}%")
            if confidence > threshold:
                print(f"Match found with user ID: {stored['user_id']} (Confidence: {confidence:.2f}%)")
                matching_users.append({
                    "user_id": stored["user_id"],
                    "name": stored["name"],
                    "section": stored["section"],
                    "standard_division": stored["standard_division"],
                    "confidence": confidence
                })
                match_found = True
                break  # Exit after the first match
        
        if not match_found:
           # print("No match found above the threshold.")
            return {"error": "No match found"}
        
        return {"matches": matching_users}
    else:
       # print("No face detected or embedding failed.")
        return {"error": "No face detected or embedding failed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


#uvicorn main:app --reload --host 0.0.0.0 --port 8000