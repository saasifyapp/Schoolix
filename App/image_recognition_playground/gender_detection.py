import cv2
import numpy as np
import insightface
import torch

# Ensure InsightFace uses GPU if available
ctx_id = 0 if torch.cuda.is_available() else -1  # 0 for GPU, -1 for CPU
face_model = insightface.app.FaceAnalysis()
face_model.prepare(ctx_id=ctx_id)  

def detect_gender(image_path):
    img = cv2.imread(image_path)

    if img is None:
        print(f"Error: Unable to read image '{image_path}'")
        return None

    faces = face_model.get(img)

    if not faces:
        print(f"No face detected in '{image_path}'.")
        return None

    gender = "Male" if faces[0].gender == 1 else "Female"
    return gender

# Test images
image_path1 = "C:/Users/yashi/Desktop/Schoolix_App/Schoolix/App/image_recognition_playground/1.jpg"  
image_path2 = "C:/Users/yashi/Desktop/Schoolix_App/Schoolix/App/image_recognition_playground/1.jpg"  

gender1 = detect_gender(image_path1)
gender2 = detect_gender(image_path2)

print(f"Gender for {image_path1}: {gender1}")
print(f"Gender for {image_path2}: {gender2}")
