# F1 Visual Race Intelligence — AI Service

FastAPI service interfacing the MERN web application with the computer vision / YOLO video analysis pipeline.

## Current Mode: Mock AI Mode

The service is currently running in **Mock AI Mode** (`USE_MOCK_AI=true`). This generates realistic telemetry, constructor breakdowns, object tracking cards, grouped flag events, a chronological timeline, and a detection-density heatmap (PNG) so the full application stack can be developed, tested, and demonstrated before final model training completes.

## Endpoints

- `GET /health` : Returns `{ "status": "ok", "service": "f1-ai-service" }`
- `GET /config` : Returns non-sensitive config information `{ "mock_mode": true, ... }`
- `POST /analyze` : Accepts `multipart/form-data` with `video` file, processes video, and returns JSON analysis results with generated heatmap and analyzed video filenames.
- `GET /outputs/{filename}` : Serves generated output files (heatmaps, analyzed videos).

---

## Future Integration Steps (When YOLO Models Are Ready)

When your models are trained and your pipeline is ready:

1. **Place your trained `.pt` weights into `models/`**:
   ```
   ai-service/
   └── models/
       ├── constructor_best.pt
       └── flag_best.pt
   ```

2. **Add your pipeline modules into `ai-service/`**:
   ```
   ai-service/
   ├── inference.py
   └── pipeline/
       ├── video_processor.py
       ├── constructor_detector.py
       ├── flag_detector.py
       ├── tracker.py
       ├── event_engine.py
       ├── statistics.py
       └── heatmap.py
   ```

3. **Connect in `main.py`**:
   In `main.py`, under the `else` branch of `POST /analyze`:
   ```python
   from inference import run_video_pipeline

   result = run_video_pipeline(saved_video_path)
   return result
   ```

4. **Toggle environment variable in `.env`**:
   ```env
   USE_MOCK_AI=false
   ```

The REST contract returned from `inference.py` matches the schema already defined in `main.py` and handled by the Express backend and React dashboard.
