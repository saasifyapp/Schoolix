import os
import logging
import cv2
import numpy as np
import insightface
import torch
import pickle
import time

# Suppress logs
logging.getLogger("insightface").setLevel(logging.ERROR)
cv2.setLogLevel(0)
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"

# Define necessary paths
base_path = '/content/'
live_image_path = os.path.join(base_path, '10.jpg')  # Live image for comparison
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

def load_embeddings(embeddings_path):
    """Load embeddings of reference images from storage."""
    if os.path.exists(embeddings_path):
        with open(embeddings_path, 'rb') as f:
            return pickle.load(f)
    else:
        return None

def cosine_similarity_np(ref_embedding, img_embedding):
    """Computes cosine similarity using NumPy."""
    dot_product = np.dot(ref_embedding, img_embedding)
    norm_product = np.linalg.norm(ref_embedding) * np.linalg.norm(img_embedding)
    similarity = dot_product / norm_product
    confidence = (similarity + 1) / 2 * 100  # Convert to percentage (0-100%)
    return similarity, confidence

def verify_faces(live_image, embeddings_path, threshold=75):
    """Compares live image against multiple reference images using cosine similarity."""
    embeddings = load_embeddings(embeddings_path)
    if embeddings is None:
        print("Embeddings not found. Please make sure they are saved.")
        return

    face_model = load_model()

    if not os.path.exists(live_image):
        print(f"Live image '{os.path.basename(live_image)}' not found! Exiting.")
        return

    print(f"\nComparing {os.path.basename(live_image)} against reference images using buffalo_l model:")

    live_embedding = extract_embedding(face_model, live_image)
    if live_embedding is None:
        print("Failed to extract live image embedding. Exiting.")
        return

    matching_image_path = None

    comparison_start_time = time.time()  # Start time for comparison

    for img_path, ref_embedding in embeddings.items():
        similarity, confidence = cosine_similarity_np(ref_embedding, live_embedding)
        if confidence > threshold:
            print(f"Match found with image: {os.path.basename(img_path)}, Confidence: {confidence:.2f}%")
            matching_image_path = img_path
            break

    comparison_end_time = time.time()  # End time for comparison
    comparison_time = comparison_end_time - comparison_start_time  # Calculate comparison time

    if matching_image_path is None:
        print("No matches found above the threshold.")
        
    print(f"\nComparison time: {comparison_time:.2f} seconds")
    
    return matching_image_path

# Comparing using buffalo_l model
try:
    match_image_path = verify_faces(live_image_path, embeddings_path, threshold=75)
    if match_image_path:
        print(f"Match found with image: {os.path.basename(match_image_path)}")
    else:
        print("No match found.")
except Exception as e:
    print(f"An error occurred while comparing with buffalo_l model: {str(e)}")