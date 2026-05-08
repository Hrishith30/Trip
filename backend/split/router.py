from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/")
async def get_expenses():
    return {"message": "Expense list"}

@router.post("/add")
async def add_expense():
    return {"message": "Expense added"}
