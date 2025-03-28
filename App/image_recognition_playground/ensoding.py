import os
import cv2
import numpy as np
import face_recognition

# Define the first image (to be "stored")
image_file_1 = 'girl.jpg'
# Define the second image (to compare)
image_file_2 = 'girl.jpg'  # Replace with your second image

# Check if both image files exist
for image_file in [image_file_1, image_file_2]:
    if not os.path.exists(image_file):
        print(f"Error: File '{image_file}' not found in {os.getcwd()}!")
        exit()

# Function to encode an image and return its facial feature vector
def encode_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not load image {image_path}!")
        return None
    
    # Convert image from BGR (OpenCV format) to RGB (face_recognition format)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Find the face locations and encodings
    face_encodings = face_recognition.face_encodings(rgb_img)
    if len(face_encodings) == 0:
        print(f"No face detected in {image_path}")
        return None

    # Take the first detected face's encoding
    return face_encodings[0]

# Step 1: Encode and "store" the first image
face_encoding_1 = encode_image(image_file_1)
if face_encoding_1 is None:
    exit()

# Step 2: Encode the second image
face_encoding_2 = encode_image(image_file_2)
if face_encoding_2 is None:
    exit()

# Step 3: Compare the two facial feature vectors
# `face_recognition` provides a utility for comparing face encodings
results = face_recognition.compare_faces([face_encoding_1], face_encoding_2)
if results[0]:
    print("\nThe images are of the same person.")
else:
    print("\nThe images are of different persons.")