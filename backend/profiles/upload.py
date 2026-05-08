from fastapi import APIRouter, UploadFile, File, HTTPException
from firebase_config import db
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()


router = APIRouter()

# Configure Cloudinary
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)


@router.post("/upload-photo/{uid}")
async def upload_photo(uid: str, file: UploadFile = File(...)):
    try:
        # Check if file is an image
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        # Upload to Cloudinary
        # We pass the file stream directly
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"wayfarer/profiles/{uid}",
            public_id="profile_pic",
            overwrite=True,
            resource_type="image"
        )
        
        # Get the public URL
        public_url = result.get("secure_url")
        
        # Update Firestore
        db.collection("users").document(uid).update({"photo_url": public_url})
        
        return {"photo_url": public_url}
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
