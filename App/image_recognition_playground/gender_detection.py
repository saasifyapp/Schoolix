import cv2
import os
import numpy as np

# Define the image file with full path
image_file = 'C:/Users/ingaleya/Desktop/Schoolix/Schoolix/App/image_recognition_playground/boy.jpg'

# Check if the image file exists
if not os.path.exists(image_file):
    print(f"Error: File '{image_file}' not found in {os.getcwd()}!")
    exit()

# Load the image
img = cv2.imread(image_file)
if img is None:
    print("Error: Could not load image! Check file path or integrity.")
    exit()

# Load face detection model (Haar Cascade)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Define full paths for gender model files
model_folder = 'C:/Users/ingaleya/Desktop/Schoolix/Schoolix/App/image_recognition_playground/'
prototxt_file = os.path.join(model_folder, 'gender_deploy.prototxt')
caffemodel_file = os.path.join(model_folder, 'gender_net.caffemodel')

# Load gender classification model (Caffe)
try:
    gender_net = cv2.dnn.readNetFromCaffe(prototxt_file, caffemodel_file)
except Exception as e:
    print(f"Error loading gender model: {e}")
    exit()

# Gender labels
gender_list = ['Male', 'Female']

# Convert to grayscale for face detection
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect faces with adjusted parameters
faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(50, 50))

# Check if any faces were detected
if len(faces) == 0:
    print("No faces detected in the image!")
else:
    # Process the first detected face
    for (x, y, w, h) in faces:
        # Extract the face region with a slight padding
        padding = 10
        face_roi = img[max(0, y-padding):y+h+padding, max(0, x-padding):x+w+padding]
        
        # Prepare the face for gender classification (resize to 227x227)
        blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), (104.0, 177.0, 123.0))
        gender_net.setInput(blob)
        
        # Predict gender with confidence
        gender_preds = gender_net.forward()
        gender_idx = gender_preds[0].argmax()
        gender = gender_list[gender_idx]
        confidence = gender_preds[0][gender_idx] * 100  # Convert to percentage
        
        # Print the result with confidence
        print(f"Predicted gender: {gender} (Confidence: {confidence:.2f}%)")
        break  # Only process the first face