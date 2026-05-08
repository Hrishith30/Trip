import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from dotenv import load_dotenv
import sys

load_dotenv()

# Initialize Firebase Admin SDK
service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")

try:
    if not firebase_admin._apps:
        if os.path.exists(service_account_path):
            print(f"Initializing Firebase with service account: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Service account file not found at {service_account_path}. Attempting default initialization...")
            firebase_admin.initialize_app()
    
    # Verify initialization
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"\nCRITICAL ERROR: Firebase could not be initialized.")
    print(f"Error details: {e}")
    sys.exit(1)
