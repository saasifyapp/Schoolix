import os
import cv2
import numpy as np
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define paths
base_path = 'C:/Users/ingaleya/Desktop/Schoolix/Schoolix/App/image_recognition_playground/'
image_files = [os.path.join(base_path, f'{i}.jpg') for i in range(1, 6)]  # Images 1.jpg to 5.jpg
reference_image = os.path.join(base_path, '6.jpg')  # Reference image 6.jpg
face_detector_model = os.path.join(base_path, 'opencv_face_detector_uint8.pb')
face_detector_config = os.path.join(base_path, 'opencv_face_detector.pbtxt')

# Load DNN model and FLANN matcher once
net = cv2.dnn.readNetFromTensorflow(face_detector_model, face_detector_config)
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params, search_params)

# Preprocessing
def preprocess_image(image_path, max_size=600):
    img = cv2.imread(image_path)
    if img is None:
        logger.error(f"Could not load image {image_path}!")
        return None
    h, w = img.shape[:2]
    scale = min(max_size / h, max_size / w)
    if scale < 1:
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return img

# Face detection with padding
def detect_faces_dnn(image_path, net, confidence_threshold=0.5, min_face_size=50, padding=0.2):
    img = preprocess_image(image_path)
    if img is None:
        return None, None
    h, w = img.shape[:2]
    blob = cv2.dnn.blobFromImage(img, 1.0, (300, 300), (104.0, 117.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x, y, x1, y1) = box.astype("int")
            if (x1 - x) > min_face_size and (y1 - y) > min_face_size:
                # Add padding to the face region
                pad_w, pad_h = int((x1 - x) * padding), int((y1 - y) * padding)
                x, y = max(0, x - pad_w), max(0, y - pad_h)
                x1, y1 = min(w, x1 + pad_w), min(h, y1 + pad_h)
                faces.append((x, y, x1, y1))
    logger.info(f"Detected {len(faces)} faces in {image_path}")
    return faces, img

# Feature extraction
def describe_face_with_sift(face_img):
    sift = cv2.SIFT_create()
    keypoints, descriptors = sift.detectAndCompute(face_img, None)
    if descriptors is None or len(keypoints) == 0:
        logger.debug(f"No keypoints detected in face image.")
        return [], None
    logger.debug(f"Extracted {len(keypoints)} keypoints.")
    return keypoints, descriptors

# Matching with debugging
def match_descriptors(des1_list, des2_list, flann=flann):
    scores = []
    for i, (des1, des2) in enumerate(zip(des1_list, des2_list)):
        if des1 is None or des2 is None or len(des1) == 0 or len(des2) == 0:
            logger.debug(f"Face pair {i+1}: No descriptors available. Score: 0%")
            scores.append(0)
            continue
        matches = flann.knnMatch(des1, des2, k=2)
        good_matches = [m for m, n in matches if m.distance < 0.7 * n.distance]
        score = len(good_matches) / min(len(des1), len(des2)) * 100
        logger.debug(f"Face pair {i+1}: {len(des1)} vs {len(des2)} descriptors, {len(good_matches)} good matches, Score: {score:.2f}%")
        scores.append(score)
    similarity_score = max(scores) if scores else 0  # Use max instead of average for single-person scenario
    return similarity_score

# Process multiple images into a database
def build_face_database(image_files, net):
    database = {}
    for image_file in image_files:
        if not os.path.exists(image_file):
            logger.error(f"File '{image_file}' not found! Skipping.")
            continue
        faces, img = detect_faces_dnn(image_file, net)
        if not faces:
            logger.error(f"No faces detected in {image_file}. Skipping.")
            continue
        kp_list, des_list = [], []
        for (x, y, x1, y1) in faces:
            face_img = img[y:y1, x:x1]
            face_img_gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            kp, des = describe_face_with_sift(face_img_gray)
            kp_list.append(kp)
            des_list.append(des)
        database[image_file] = des_list
    return database

# Main logic
logger.info("Building face database from images 1.jpg to 5.jpg...")
database = build_face_database(image_files, net)
if not database:
    logger.error("No valid images in database. Exiting.")
    exit()

# Process the reference image (6.jpg)
if not os.path.exists(reference_image):
    logger.error(f"File '{reference_image}' not found! Exiting.")
    exit()

faces_ref, img_ref = detect_faces_dnn(reference_image, net)
if not faces_ref:
    logger.error(f"No faces detected in {reference_image}. Exiting.")
    exit()

kp_ref_list, des_ref_list = [], []
for (x, y, x1, y1) in faces_ref:
    face_img = img_ref[y:y1, x:x1]
    face_img_gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
    kp, des = describe_face_with_sift(face_img_gray)
    kp_ref_list.append(kp)
    des_ref_list.append(des)

# Compare reference image against database
threshold = 10  # Lowered from 15 to account for angle variations
logger.info(f"\nComparing {reference_image} against database images:")
for db_image, db_des_list in database.items():
    similarity_score = match_descriptors(des_ref_list, db_des_list, flann)
    logger.info(f"Similarity with {db_image}: {similarity_score:.2f}%")
    if similarity_score > threshold:
        logger.info(f"  -> Match: Likely the same person.")
    else:
        logger.info(f"  -> No match: Likely different persons.")