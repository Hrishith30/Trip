from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    if not FIREBASE_WEB_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Web API Key not configured"
        )
        
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={FIREBASE_WEB_API_KEY}"
    payload = {
        "requestType": "PASSWORD_RESET",
        "email": request.email
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if response.status_code != 200:
        error_message = data.get("error", {}).get("message", "Request failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
        
    return {"message": "Password reset email sent"}
