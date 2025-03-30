import os
import logging
import cv2
import numpy as np
import insightface
import torch
from concurrent.futures import ThreadPoolExecutor

# Suppress logs
logging.getLogger("insightface").setLevel(logging.ERROR)
cv2.setLogLevel(0)
os.environ["TORCH_CPP_LOG_LEVEL"] = "ERROR"
os.environ["CUDA_LAUNCH_BLOCKING"] = "0"

# Define paths
base_path = 'C:/Users/yashi/Desktop/Schoolix_App/Schoolix/App/image_recognition_playground/'
image_files = [os.path.join(base_path, f'{i}.jpg') for i in range(1, 6)]  # Images 1.jpg to 5.jpg
reference_image = os.path.join(base_path, '6.jpg')  # Reference image 6.jpg

# Check for GPU
ctx_id = 0 if torch.cuda.is_available() else -1  # Use GPU if available

# Load a faster model
face_model = insightface.app.FaceAnalysis(name='buffalo_l')  # Faster than buffalo_s
face_model.prepare(ctx_id=ctx_id)

def extract_embedding(image_path):
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

def cosine_similarity_np(ref_embedding, img_embedding):
    """Computes cosine similarity using NumPy (faster than Scikit-learn)."""
    dot_product = np.dot(ref_embedding, img_embedding)
    norm_product = np.linalg.norm(ref_embedding) * np.linalg.norm(img_embedding)
    similarity = dot_product / norm_product
    confidence = (similarity + 1) / 2 * 100  # Convert to percentage (0-100%)
    return similarity, confidence

def process_image(image):
    """Processes a single image and returns similarity and confidence."""
    if not os.path.exists(image):
        print(f"Image '{os.path.basename(image)}' not found! Skipping.")
        return image, None, None

    img_embedding = extract_embedding(image)
    if img_embedding is None:
        return image, None, None

    similarity, confidence = cosine_similarity_np(ref_embedding, img_embedding)
    return image, similarity, confidence

def verify_faces(reference_image, image_files, threshold=40):
    """Compares reference image against database images using cosine similarity."""
    if not os.path.exists(reference_image):
        print(f"Reference image '{os.path.basename(reference_image)}' not found! Exiting.")
        return

    global ref_embedding
    ref_embedding = extract_embedding(reference_image)
    if ref_embedding is None:
        print("Failed to extract reference image embedding. Exiting.")
        return

    print(f"\nComparing {os.path.basename(reference_image)} against database images:")

    # Limit max workers to CPU count for optimal speed
    num_workers = min(len(image_files), os.cpu_count() or 4)
    
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        results = list(executor.map(process_image, image_files))

    for image, similarity, confidence in results:
        if similarity is None:
            continue

        print(f"Similarity with {os.path.basename(image)}: {similarity:.2f} | Confidence: {confidence:.2f}%")

        if confidence > threshold:
            print(f"  -> Match: Likely the same person.")
        else:
            print(f"  -> No match: Likely different persons.")

# Run the optimized face verification
verify_faces(reference_image, image_files)
