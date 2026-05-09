from fastapi import APIRouter
from firebase_config import db
import random
import string

router = APIRouter()

def generate_friend_code():
    chars = string.ascii_uppercase + string.digits
    return "WF-" + "".join(random.choices(chars, k=4)) + "-" + "".join(random.choices(chars, k=4))

def get_unique_friend_code():
    while True:
        code = generate_friend_code()
        docs = db.collection("users").where("friend_code", "==", code).limit(1).get()
        if len(docs) == 0:
            return code

@router.get("/{uid}")
async def get_profile(uid: str):
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    
    if user_doc.exists:
        data = user_doc.to_dict()
        # Backward compatibility: Generate code if missing
        if "friend_code" not in data or not data["friend_code"]:
            new_code = get_unique_friend_code()
            user_ref.update({"friend_code": new_code})
            data["friend_code"] = new_code
        return data
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
