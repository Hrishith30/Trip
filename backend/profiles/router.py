from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/{uid}")
async def get_profile(uid: str):
    user_doc = db.collection("users").document(uid).get()
    if user_doc.exists:
        return user_doc.to_dict()
    return {"error": "User not found"}

@router.put("/{uid}")
async def update_profile(uid: str, data: dict):
    # Update Firestore
    db.collection("users").document(uid).update(data)
    
    # Sync with Firebase Auth if critical fields changed
    auth_updates = {}
    if "display_name" in data: auth_updates["display_name"] = data["display_name"]
    if "email" in data: auth_updates["email"] = data["email"]
    
    if auth_updates:

        auth.update_user(uid, **auth_updates)
        
    return {"message": "Profile updated"}

from firebase_admin import auth

@router.delete("/{uid}")
async def delete_profile(uid: str):
    # Delete from Firestore
    db.collection("users").document(uid).delete()
    # Delete from Firebase Auth
    auth.delete_user(uid)
    return {"message": "User deleted successfully"}
