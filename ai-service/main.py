import os
import shutil
import uuid
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from inference import run_video_pipeline

from heatmap_generator import generate_heatmap

# Config
USE_MOCK_AI = os.getenv("USE_MOCK_AI", "false").lower() in ("true", "1", "yes")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEOS_DIR = os.path.join(BASE_DIR, "videos")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
MODELS_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

app = FastAPI(
    title="F1 Visual Race Intelligence - AI Service",
    description="FastAPI service interfacing with YOLO & Video Analysis Pipeline",
    version="1.0.0"
)

# Enable CORS for Express and Client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve outputs statically
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")


@app.get("/health")
def health_check():
    """Returns whether the AI service is operational."""
    return {
        "status": "ok",
        "service": "f1-ai-service"
    }


@app.get("/config")
def get_config():
    """
    Returns basic non-sensitive configuration information.
    Does not expose local filesystem paths.
    """
    return {
        "mock_mode": USE_MOCK_AI,
        "service": "F1 Visual Race Intelligence",
        "version": "1.0.0"
    }


@app.post("/analyze")
async def analyze_video_endpoint(video: UploadFile = File(...)):
    """
    Accepts video via multipart/form-data.
    When USE_MOCK_AI is true, runs simulated pipeline & returns structured mock results.
    When USE_MOCK_AI is false, invokes the user's real computer-vision pipeline.
    """
    if not video.filename:
        raise HTTPException(status_code=400, detail="No video file provided")

    # Generate a unique run ID for outputs
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    clean_filename = video.filename.replace(" ", "_")
    saved_video_path = os.path.join(VIDEOS_DIR, f"{run_id}_{clean_filename}")

    try:
        # Save uploaded video locally in ai-service/videos/
        with open(saved_video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")

    if USE_MOCK_AI:
        # -------------------------------------------------------------
        # MOCK AI PIPELINE EXECUTION
        # -------------------------------------------------------------
        heatmap_filename = f"{run_id}_heatmap.png"
        heatmap_output_path = os.path.join(OUTPUTS_DIR, heatmap_filename)
        
        # Generate spatial detection-density heatmap
        try:
            generate_mock_heatmap(heatmap_output_path)
        except Exception as e:
            print(f"[Warning] Failed to generate heatmap: {e}")

        # Analyzed video: save/copy the incoming video as the displayable video
        analyzed_video_filename = f"{run_id}_analyzed.mp4"
        analyzed_video_path = os.path.join(OUTPUTS_DIR, analyzed_video_filename)
        try:
            shutil.copyfile(saved_video_path, analyzed_video_path)
        except Exception as e:
            analyzed_video_filename = f"{run_id}_{clean_filename}"

        # Build mock response conforming strictly to Section 9 & 10-15
        mock_result = {
            "status": "completed",
            "video": {
                "filename": video.filename,
                "duration": 92,               # 1m 32s
                "frames_processed": 2760
            },
            "statistics": {
                "total_detections": 842,
                "total_cars": 18,
                "total_events": 5,
                "average_confidence": 0.914,
                "frames_processed": 2760
            },
            "constructors": [
                {"name": "Ferrari", "detections": 342, "percentage": 40.6, "color": "#E80020"},
                {"name": "McLaren", "detections": 298, "percentage": 35.4, "color": "#FF8000"},
                {"name": "Mercedes", "detections": 276, "percentage": 32.8, "color": "#27F4D2"},
                {"name": "Red Bull", "detections": 251, "percentage": 29.8, "color": "#3671C6"},
                {"name": "Aston Martin", "detections": 142, "percentage": 16.9, "color": "#229971"},
                {"name": "Alpine", "detections": 98, "percentage": 11.6, "color": "#FF87BC"}
            ],
            "tracked_objects": [
                {
                    "track_id": 3,
                    "constructor": "Ferrari",
                    "frames_detected": 421,
                    "confidence": 0.92,
                    "first_detected": "00:04",
                    "last_detected": "01:18"
                },
                {
                    "track_id": 4,
                    "constructor": "McLaren",
                    "frames_detected": 388,
                    "confidence": 0.94,
                    "first_detected": "00:06",
                    "last_detected": "01:25"
                },
                {
                    "track_id": 7,
                    "constructor": "Mercedes",
                    "frames_detected": 352,
                    "confidence": 0.89,
                    "first_detected": "00:10",
                    "last_detected": "01:14"
                },
                {
                    "track_id": 1,
                    "constructor": "Red Bull",
                    "frames_detected": 340,
                    "confidence": 0.95,
                    "first_detected": "00:02",
                    "last_detected": "01:28"
                },
                {
                    "track_id": 14,
                    "constructor": "Aston Martin",
                    "frames_detected": 210,
                    "confidence": 0.88,
                    "first_detected": "00:15",
                    "last_detected": "01:05"
                },
                {
                    "track_id": 10,
                    "constructor": "Alpine",
                    "frames_detected": 145,
                    "confidence": 0.86,
                    "first_detected": "00:22",
                    "last_detected": "00:58"
                }
            ],
            "events": [
                {
                    "event_type": "VSC",
                    "start_time": 18,
                    "end_time": 31,
                    "start_timestamp": "00:18",
                    "end_timestamp": "00:31",
                    "duration": 13,
                    "confidence": 0.94,
                    "description": "Virtual Safety Car deployed in Sector 2"
                },
                {
                    "event_type": "Yellow Flag",
                    "start_time": 47,
                    "end_time": 52,
                    "start_timestamp": "00:47",
                    "end_timestamp": "00:52",
                    "duration": 5,
                    "confidence": 0.91,
                    "description": "Local Yellow Flag waved at Turn 4"
                },
                {
                    "event_type": "Green Flag",
                    "start_time": 65,
                    "end_time": 70,
                    "start_timestamp": "01:05",
                    "end_timestamp": "01:10",
                    "duration": 5,
                    "confidence": 0.89,
                    "description": "Track clear, Racing resumed in all sectors"
                },
                {
                    "event_type": "Safety Car",
                    "start_time": 76,
                    "end_time": 88,
                    "start_timestamp": "01:16",
                    "end_timestamp": "01:28",
                    "duration": 12,
                    "confidence": 0.93,
                    "description": "Full Safety Car deployed on main straight"
                }
            ],
            "timeline": [
                {"timestamp": "00:02", "time": 2, "label": "Red Bull (Track #1) detected", "type": "detection"},
                {"timestamp": "00:04", "time": 4, "label": "Ferrari (Track #3) detected", "type": "detection"},
                {"timestamp": "00:06", "time": 6, "label": "McLaren (Track #4) detected", "type": "detection"},
                {"timestamp": "00:18", "time": 18, "label": "VSC started", "type": "flag_event"},
                {"timestamp": "00:21", "time": 21, "label": "McLaren high speed pass in Sector 2", "type": "detection"},
                {"timestamp": "00:31", "time": 31, "label": "VSC ended", "type": "flag_event"},
                {"timestamp": "00:47", "time": 47, "label": "Yellow flag waved", "type": "flag_event"},
                {"timestamp": "00:52", "time": 52, "label": "Yellow flag ended", "type": "flag_event"},
                {"timestamp": "01:05", "time": 65, "label": "Green flag shown - Track clear", "type": "flag_event"},
                {"timestamp": "01:16", "time": 76, "label": "Safety Car deployed", "type": "flag_event"},
                {"timestamp": "01:28", "time": 88, "label": "Safety Car in this lap", "type": "flag_event"}
            ],
            "heatmap": heatmap_filename,
            "analyzed_video": analyzed_video_filename
        }

        return mock_result

    else:
        # -------------------------------------------------------------
        # REAL AI PIPELINE
        # -------------------------------------------------------------

        analyzed_video_filename = (
            f"{run_id}_analyzed.mp4"
        )

        heatmap_filename = (
            f"{run_id}_heatmap.png"
        )

        analyzed_video_path = os.path.join(
            OUTPUTS_DIR,
            analyzed_video_filename
        )

        heatmap_output_path = os.path.join(
            OUTPUTS_DIR,
            heatmap_filename
        )

        try:

            print()
            print("=" * 60)
            print("REAL AI PIPELINE STARTING")
            print("=" * 60)
            print(f"Input video : {saved_video_path}")
            print(f"Output video: {analyzed_video_path}")
            print(f"Heatmap     : {heatmap_output_path}")
            print()

            ai_result = run_video_pipeline(
                video_path=saved_video_path,
                output_video_path=analyzed_video_path,
                heatmap_path=heatmap_output_path
            )

            print()
            print("=" * 60)
            print("REAL AI PIPELINE COMPLETED")
            print("=" * 60)
            print()

        except Exception as e:

            print()
            print("=" * 60)
            print("REAL AI PIPELINE FAILED")
            print("=" * 60)
            print(str(e))
            print()

            raise HTTPException(
                status_code=500,
                detail=f"AI pipeline failed: {str(e)}"
            )

        # -------------------------------------------------------------
        # Convert real pipeline result into API response
        # -------------------------------------------------------------

        events = ai_result.get(
            "events",
            []
        )

        # Build a simple timeline from real flag events.
        timeline = []

        for event in events:

            event_type = event.get(
                "event_type",
                "Unknown"
            )

            start_time = event.get(
                "start_time",
                0
            )

            end_time = event.get(
                "end_time",
                start_time
            )

            start_timestamp = event.get(
                "start_timestamp",
                "00:00"
            )

            end_timestamp = event.get(
                "end_timestamp",
                "00:00"
            )

            timeline.append({
                "timestamp": start_timestamp,
                "time": start_time,
                "label": f"{event_type} started",
                "type": "flag_event"
            })

            timeline.append({
                "timestamp": end_timestamp,
                "time": end_time,
                "label": f"{event_type} ended",
                "type": "flag_event"
            })

        # -------------------------------------------------------------
        # Final real AI response
        # -------------------------------------------------------------

        real_result = {
            "status": "completed",

            "video": ai_result.get(
                "video",
                {}
            ),

            "statistics": ai_result.get(
                "statistics",
                {}
            ),

            "constructors": ai_result.get(
                "constructors",
                []
            ),

            "tracked_objects": ai_result.get(
                "tracked_objects",
                []
            ),

            "events": events,

            "timeline": timeline,

            "heatmap": heatmap_filename,

            "analyzed_video": analyzed_video_filename
        }

        return real_result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
