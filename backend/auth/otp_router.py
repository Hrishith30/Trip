from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_config import db
from firebase_admin import auth
import random
import datetime

router = APIRouter()

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/send-otp")
async def send_otp(request: OTPRequest):
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    expiry = datetime.datetime.now() + datetime.timedelta(minutes=10)
    
    # Store OTP in Firestore
    db.collection("otps").document(request.email).set({
        "code": otp_code,
        "expiry": expiry,
        "expire_at": expiry, # For Firestore TTL automatic deletion
        "used": False
    })

    
    # MOCK: In a real app, you would send an email here using SendGrid/Mailgun
    print(f"\n[EMAIL MOCK] To: {request.email}")
    print(f"[EMAIL MOCK] Your password reset OTP is: {otp_code}")
    print(f"[EMAIL MOCK] It expires in 10 minutes.\n")
    
    return {"message": "OTP sent successfully to your email"}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    otp_doc = db.collection("otps").document(request.email).get()
    
    if not otp_doc.exists:
        raise HTTPException(status_code=400, detail="No OTP found for this email")
    
    otp_data = otp_doc.to_dict()
    
    # Check if OTP is correct and not expired
    if otp_data["code"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if otp_data["used"]:
        raise HTTPException(status_code=400, detail="OTP already used")
        
    if datetime.datetime.now() > otp_data["expiry"].replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # OTP is valid, change password in Firebase Auth
    try:
        user = auth.get_user_by_email(request.email)
        auth.update_user(user.uid, password=request.new_password)
        
        # Mark OTP as used
        db.collection("otps").document(request.email).update({"used": True})
        
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EmailOTPVerifyRequest(BaseModel):
    uid: str
    old_email: str
    new_email: str
    otp: str

@router.post("/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerifyRequest):
    otp_doc = db.collection("otps").document(request.old_email).get()
    
    if not otp_doc.exists:
        raise HTTPException(status_code=400, detail="No OTP found for this email")
    
    otp_data = otp_doc.to_dict()
    
    if otp_data["code"] != request.otp or otp_data["used"]:
        raise HTTPException(status_code=400, detail="Invalid or used OTP")
        
    if datetime.datetime.now() > otp_data["expiry"].replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    try:
        # 1. Update Firebase Auth
        auth.update_user(request.uid, email=request.new_email)
        
        # 2. Update Firestore
        db.collection("users").document(request.uid).update({"email": request.new_email})
        
        # 3. Mark OTP as used
        db.collection("otps").document(request.old_email).update({"used": True})
        
        return {"message": "Email updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

