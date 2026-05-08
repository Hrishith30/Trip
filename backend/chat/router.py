from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/")
async def get_chats():
    return {"message": "Chat list"}

@router.post("/send")
async def send_message():
    return {"message": "Message sent"}
