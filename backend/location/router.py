from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
async def search_location(query: str):
    return {"results": []}
