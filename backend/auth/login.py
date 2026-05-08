from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Firebase Web API Key is needed for email/password sign-in from backend
FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    if not FIREBASE_WEB_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Web API Key not configured"
        )
        
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
    payload = {
        "email": request.email,
        "password": request.password,
        "returnSecureToken": True
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if response.status_code != 200:
        error_message = data.get("error", {}).get("message", "Login failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message
        )
        
    return {
        "idToken": data.get("idToken"),
        "refreshToken": data.get("refreshToken"),
        "expiresIn": data.get("expiresIn"),
        "localId": data.get("localId")
    }
