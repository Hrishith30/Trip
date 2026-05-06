from ytmusicapi import YTMusic
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import yt_dlp

app = FastAPI(title="Wayfarer Music API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yt = YTMusic()

@app.get("/stream/{video_id}")
async def get_stream_url(video_id: str):
    """
    Get a direct streamable audio URL for a YouTube Video ID.
    """
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return {"url": info['url']}
    except Exception as e:
        print(f"Error extracting stream: {e}")
        raise HTTPException(status_code=500, detail="Could not extract stream URL")

@app.get("/search")
async def search_music(q: str = Query(..., min_length=1)):
    """
    Search for music on YouTube Music and return formatted results.
    """
    try:
        results = yt.search(q, filter="songs")
        
        formatted_results = []
        for item in results:
            # Extract the highest resolution thumbnail
            thumbnails = item.get('thumbnails', [])
            cover = thumbnails[-1]['url'] if thumbnails else ""
            
            # Format duration from mm:ss to seconds
            duration_str = item.get('duration', '0:00')
            parts = duration_str.split(':')
            duration = 0
            try:
                if len(parts) == 2:
                    duration = int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3:
                    duration = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            except:
                duration = 0

            formatted_results.append({
                "id": item.get('videoId'),
                "title": item.get('title'),
                "artist": ", ".join([a['name'] for a in item.get('artists', [])]),
                "cover": cover,
                "duration": duration,
                "album": item.get('album', {}).get('name', 'Single')
            })
            
        return formatted_results
    except Exception as e:
        print(f"Error in /search: {e}")
        return []

@app.get("/trending")
async def get_trending():
    """
    Get trending music (using a general search as a fallback for trending).
    """
    try:
        # yt.get_charts() is also an option, but search is more reliable for 'vibes'
        results = yt.search("travel chill vibes", filter="songs", limit=10)
        
        formatted_results = []
        for item in results:
            thumbnails = item.get('thumbnails', [])
            cover = thumbnails[-1]['url'] if thumbnails else ""
            
            formatted_results.append({
                "id": item.get('videoId'),
                "title": item.get('title'),
                "artist": ", ".join([a['name'] for a in item.get('artists', [])]),
                "cover": cover,
                "duration": 180, # Default if not found
                "album": item.get('album', {}).get('name', 'Single')
            })
            
        return formatted_results
    except Exception as e:
        print(f"Error in /trending: {e}")
        return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
