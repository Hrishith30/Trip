from fastapi import APIRouter, Depends, HTTPException
from firebase_config import db
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class Trip(BaseModel):
    id: Optional[str] = None
    title: str
    destination: str
    start_date: str
    end_date: str
    owner_id: str

@router.get("/", response_model=List[Trip])
async def get_trips(user_id: str):
    trips_ref = db.collection("trips").where("owner_id", "==", user_id)
    docs = trips_ref.stream()
    return [Trip(id=doc.id, **doc.to_dict()) for doc in docs]

@router.post("/")
async def create_trip(trip: Trip):
    doc_ref = db.collection("trips").document()
    trip_data = trip.dict()
    trip_data["id"] = doc_ref.id
    doc_ref.set(trip_data)
    return {"id": doc_ref.id, "message": "Trip created"}
