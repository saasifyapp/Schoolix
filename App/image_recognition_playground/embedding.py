import os
import logging
import cv2
import numpy as np
import insightface
import torch
import pickle

# Suppress logs
logging.getLogger("insightface").setLevel(logging.ERROR)
cv2.setLogLevel(0)
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"

# Define necessary paths
base_path = '/content/'
reference_images_path = [os.path.join(base_path, f'{i}.jpg') for i in range(1, 11)]  # Reference images 1.jpg to 10.jpg
embeddings_path = os.path.join(base_path, 'embeddings.pkl')  # Path to store/load the precomputed embeddings

# Check for GPU
ctx_id = 0 if torch.cuda.is_available() else -1  # Use GPU if available

def load_model(model_name='buffalo_l'):
    face_model = insightface.app.FaceAnalysis(name=model_name)
    face_model.prepare(ctx_id=ctx_id)
    return face_model

def extract_embedding(face_model, image_path):
    """Extracts face embeddings using InsightFace."""
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Unable to read image '{os.path.basename(image_path)}'")
        return None

    img = cv2.resize(img, (320, 320))  # Reduce image size for faster processing
    faces = face_model.get(img)

    if not faces:
        print(f"No face detected in '{os.path.basename(image_path)}'.")
        return None

    return faces[0].embedding  # Return the first face's embedding

def save_embeddings(reference_images, embeddings_path):
    """Save embeddings of reference images to storage."""
    face_model = load_model()
    embeddings = {}
    for img_path in reference_images:
        embedding = extract_embedding(face_model, img_path)
        if embedding is not None:
            embeddings[img_path] = embedding
    with open(embeddings_path, 'wb') as f:
        pickle.dump(embeddings, f)
    print("Reference images embeddings saved.")

# Ensure embeddings are saved before comparison
save_embeddings(reference_images_path, embeddings_path)