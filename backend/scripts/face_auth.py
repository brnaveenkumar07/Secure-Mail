import sys
import json
import os
from deepface import DeepFace
import numpy as np

def generate_embedding(img_path):
    try:
        # DeepFace.represent returns a list of dicts
        embedding_objs = DeepFace.represent(img_path=img_path, model_name="VGG-Face", enforce_detection=False)
        if not embedding_objs:
            return None
        # Take the first face found
        return embedding_objs[0]["embedding"]
    except Exception as e:
        print(f"Error generating embedding: {str(e)}", file=sys.stderr)
        return None

def verify_face(img_path, target_embedding):
    try:
        # Generate embedding for the new image
        current_embedding = generate_embedding(img_path)
        if not current_embedding:
            return False

        # Calculate cosine similarity or euclidean distance
        # DeepFace uses different metrics. Let's use cosine similarity manually for simplicity and control
        # or use DeepFace.verify if we had the original image. Since we stored embeddings, we compare embeddings.
        
        a = np.array(current_embedding)
        b = np.array(target_embedding)
        
        # Cosine distance
        cosine_distance = 1 - (np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
        
        # Threshold for VGG-Face with Cosine Distance is typically around 0.40
        threshold = 0.40
        
        return cosine_distance < threshold
    except Exception as e:
        print(f"Error verifying face: {str(e)}", file=sys.stderr)
        return False

def main():
    command = sys.argv[1]
    
    if command == "generate":
        img_path = sys.argv[2]
        embedding = generate_embedding(img_path)
        if embedding:
            print(json.dumps(embedding))
        else:
            sys.exit(1)
            
    elif command == "verify":
        img_path = sys.argv[2]
        # target_embedding is passed as a JSON string
        target_embedding = json.loads(sys.argv[3])
        result = verify_face(img_path, target_embedding)
        print(json.dumps(result))
        
    else:
        print("Invalid command", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
