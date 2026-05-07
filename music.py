from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import random
import uvicorn
from pydantic import BaseModel
import yt_dlp
from typing import List, Optional

app = FastAPI()

# Enable CORS for the Expo frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yt = YTMusic()

# Cache for stream URLs to improve performance
STREAM_CACHE = {}

# yt-dlp configuration for getting stream URLs
YDL_OPTS = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'quiet': True,
    'no_warnings': True,
    'nocheckcertificate': True,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

class Track(BaseModel):
    id: str
    title: str
    artist: str
    cover: str
    color: str
    duration: int
    type: str = "song"

# Modern color palette for tracks to match the premium design
COLORS = [
    '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', 
    '#3b82f6', '#ef4444', '#10b981', '#f97316', '#84cc16'
]

def format_track(song: dict, item_type: str = "song") -> Track:
    # Get the best thumbnail
    thumbnails = song.get('thumbnails', [])
    cover = thumbnails[-1]['url'] if thumbnails else "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500"
    
    # Format artists
    artists = ", ".join([a['name'] for a in song.get('artists', [])])
    
    # Get duration in seconds (default to 230 if not found)
    duration = song.get('duration_seconds') or 230
    
    return Track(
        id=song.get('videoId') or song.get('browseId') or str(random.randint(1000, 9999)),
        title=song.get('title', 'Unknown Title'),
        artist=artists or 'Unknown Artist',
        cover=cover,
        color=random.choice(COLORS),
        duration=duration,
        type=item_type
    )

@app.get("/stream/{video_id}")
async def get_stream(video_id: str):
    # Temporarily disabling cache to avoid expired YouTube URLs
    # if video_id in STREAM_CACHE:
    #     return {"url": STREAM_CACHE[video_id]}
        
    try:
        with yt_dlp.YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            url = info['url']
            headers = info.get('http_headers', {})
            duration = info.get('duration', 0)
            # STREAM_CACHE[video_id] = url
            return {"url": url, "headers": headers, "duration": duration}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tracks", response_model=List[Track])
async def get_tracks(language: str = "Global", query: Optional[str] = None):
    try:
        search_query = query if query else f"Trending {language} songs"
        results = yt.search(search_query, filter="songs", limit=20)
        return [format_track(song) for song in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search", response_model=List[Track])
async def search_tracks(q: str, filter: str = "songs"):
    try:
        results = yt.search(q, filter=filter, limit=20)
        item_type = "album" if filter == "albums" else "song"
        return [format_track(song, item_type) for song in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/album/{browse_id}", response_model=List[Track])
async def get_album_tracks(browse_id: str):
    try:
        album = yt.get_album(browse_id)
        # album tracks don't have thumbnails by default, use album thumbnail
        thumbnails = album.get('thumbnails', [])
        tracks = []
        for track in album.get('tracks', []):
            track['thumbnails'] = thumbnails
            # track inside album might just have a string for artists in some cases, but ytmusicapi parses it to dicts
            tracks.append(format_track(track, "song"))
        return tracks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting Music Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
