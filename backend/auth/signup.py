from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from firebase_admin import auth
from firebase_config import db

router = APIRouter()

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = None
    photo_url: str = None

@router.post("/signup")
async def signup(request: SignupRequest):
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.display_name
        )

        
        # Initialize user data in Firestore
        user_data = {
            "uid": user_record.uid,
            "email": user_record.email,
            "display_name": request.display_name,
            "photo_url": request.photo_url,
            "theme_preference": "auto",
            "created_at": firestore.SERVER_TIMESTAMP,

            "trips": [],
            "friends": []
        }

        db.collection("users").document(user_record.uid).set(user_data)
        
        return {
            "message": "User created successfully",
            "uid": user_record.uid
        }
    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

from firebase_admin import firestore
