from pathlib import Path

from pipelines.video_processor import VideoProcessor


# --------------------------------------------------
# Project paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

CONSTRUCTOR_MODEL = (
    BASE_DIR /
    "models" /
    "constructor_yolo11_best.pt"
)

FLAG_MODEL = (
    BASE_DIR /
    "models" /
    "flag_yolo11_best.pt"
)

OUTPUT_DIR = BASE_DIR / "outputs"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# Run complete AI pipeline
# --------------------------------------------------

def run_video_pipeline(
    video_path: str,
    output_video_path: str,
    heatmap_path: str
):
    """
    Run the complete F1 visual intelligence pipeline.

    Input:
        video_path         -> uploaded video
        output_video_path  -> analyzed video destination
        heatmap_path       -> heatmap destination

    Output:
        Dictionary containing:
        - video information
        - statistics
        - constructors
        - events
        - heatmap path
        - analyzed video path
    """

    video_path = Path(video_path)

    if not video_path.exists():
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    # --------------------------------------------------
    # Check trained models
    # --------------------------------------------------

    if not CONSTRUCTOR_MODEL.exists():
        raise FileNotFoundError(
            f"Constructor model not found: "
            f"{CONSTRUCTOR_MODEL}"
        )

    if not FLAG_MODEL.exists():
        raise FileNotFoundError(
            f"Flag model not found: "
            f"{FLAG_MODEL}"
        )

    # --------------------------------------------------
    # Initialize processor
    # --------------------------------------------------

    processor = VideoProcessor(
        constructor_model_path=str(
            CONSTRUCTOR_MODEL
        ),
        flag_model_path=str(
            FLAG_MODEL
        )
    )

    # --------------------------------------------------
    # Run pipeline
    # --------------------------------------------------

    result = processor.process(
        video_path=str(video_path),
        output_video_path=str(
            output_video_path
        ),
        heatmap_path=str(
            heatmap_path
        )
    )

    return result