from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers
from auth.signup import router as signup_router
from auth.login import router as login_router
from auth.forgotpassword import router as forgot_password_router
from auth.otp_router import router as otp_router
from profiles.upload import router as upload_router


from trips.router import router as trips_router
from chat.router import router as chat_router
from split.router import router as split_router
from profiles.router import router as profile_router
from home.router import router as home_router
from location.router import router as location_router

app = FastAPI(title="Trip App API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(signup_router, prefix="/auth", tags=["Authentication"])
app.include_router(login_router, prefix="/auth", tags=["Authentication"])
app.include_router(forgot_password_router, prefix="/auth", tags=["Authentication"])
app.include_router(otp_router, prefix="/auth", tags=["Authentication"])
app.include_router(upload_router, prefix="/profile", tags=["Profile"])


app.include_router(trips_router, prefix="/trips", tags=["Trips"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(split_router, prefix="/split", tags=["Split"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(home_router, prefix="/home", tags=["Home"])
app.include_router(location_router, prefix="/location", tags=["Location"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Trip App API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
