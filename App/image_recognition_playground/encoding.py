import os
import logging
from deepface import DeepFace
import cv2

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define paths
base_path = 'C:/Users/yashi/Desktop/Schoolix_App/Schoolix/App/image_recognition_playground/'
image_files = [os.path.join(base_path, f'{i}.jpg') for i in range(1, 6)]  # Images 1.jpg to 5.jpg
reference_image = os.path.join(base_path, '6.jpg')  # Reference image 6.jpg

# DeepFace-based face verification
def verify_faces(reference_image, image_files, model_name="VGG-Face", distance_metric="cosine", threshold=0.4):
    if not os.path.exists(reference_image):
        logger.error(f"Reference image '{reference_image}' not found! Exiting.")
        return

    logger.info(f"\nComparing {reference_image} against database images:")
    for image in image_files:
        if not os.path.exists(image):
            logger.error(f"Image '{image}' not found! Skipping.")
            continue
        
        try:
            result = DeepFace.verify(img1_path=reference_image, img2_path=image, model_name=model_name, distance_metric=distance_metric)
            similarity_score = 1 - result['distance']  # Convert distance to similarity score (higher is better)
            logger.info(f"Similarity with {image}: {similarity_score:.2f}")
            
            if similarity_score > threshold:
                logger.info(f"  -> Match: Likely the same person.")
            else:
                logger.info(f"  -> No match: Likely different persons.")
        
        except Exception as e:
            logger.error(f"Error processing {image}: {e}")

# Run the face verification
verify_faces(reference_image, image_files)
