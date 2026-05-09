from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_config import db
from firebase_admin import auth
from google.cloud.firestore_v1.base_query import FieldFilter
import random
import datetime
import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

router = APIRouter()

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

def cleanup_expired_otps():
    """Manually delete expired or used OTPs (Free tier alternative to TTL)"""
    try:
        now = datetime.datetime.now()
        # Delete expired OTPs
        expired_docs = db.collection("otps").where(filter=FieldFilter("expiry", "<", now)).get()
        for doc in expired_docs:
            doc.reference.delete()
            
        # Delete legacy 'used' OTPs
        used_docs = db.collection("otps").where(filter=FieldFilter("used", "==", True)).get()
        for doc in used_docs:
            doc.reference.delete()
    except Exception as e:
        print(f"Manual cleanup failed: {e}")

@router.post("/send-otp")
async def send_otp(request: OTPRequest):
    # Clean up old OTPs to stay within free tier limits
    cleanup_expired_otps()
    
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

    # Send Real Email using Gmail SMTP
    try:
        msg = MIMEText(f"Your password reset OTP is: {otp_code}\nIt expires in 10 minutes.")
        msg['Subject'] = 'Wayfarer - Password Reset OTP'
        msg['From'] = EMAIL_USER
        msg['To'] = request.email

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
            
        print(f"OTP sent to {request.email}")
    except Exception as e:
        print(f"Error sending email: {e}")
        # We don't raise an exception here to avoid breaking the flow if email fails in dev, 
        # but in production you might want to.
    
    
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
        
        # Delete OTP after successful use to keep collection clean
        db.collection("otps").document(request.email).delete()
        
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
        
        # 3. Delete OTP after successful use
        db.collection("otps").document(request.old_email).delete()
        
        return {"message": "Email updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

