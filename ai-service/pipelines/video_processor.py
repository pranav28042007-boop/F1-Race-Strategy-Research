import cv2
from pathlib import Path

from pipelines.constructor_detector import ConstructorDetector
from pipelines.flag_detector import FlagDetector
from pipelines.tracker import ConstructorTracker
from pipelines.event_engine import FlagEventEngine
from pipelines.statistics import StatisticsCalculator
from heatmap_generator import generate_heatmap


class VideoProcessor:

    def __init__(
        self,
        constructor_model_path: str,
        flag_model_path: str
    ):
        """
        Initialize all AI components.
        """

        print("Loading AI models...")

        self.constructor_detector = ConstructorDetector(
            constructor_model_path
        )

        self.flag_detector = FlagDetector(
            flag_model_path
        )

        self.tracker = ConstructorTracker(
            constructor_model_path
        )

        print("AI models loaded successfully.")

    def process(
        self,
        video_path: str,
        output_video_path: str,
        heatmap_path: str
    ):
        """
        Process an entire F1 video.

        Pipeline:

        Video
          ↓
        Constructor YOLO
          ↓
        ByteTrack
          ↓
        Flag YOLO
          ↓
        Event Engine
          ↓
        Statistics
          ↓
        Heatmap
          ↓
        Analyzed video
        """

        video_path = Path(video_path)
        output_video_path = Path(output_video_path)
        heatmap_path = Path(heatmap_path)

        if not video_path.exists():
            raise FileNotFoundError(
                f"Video not found: {video_path}"
            )

        output_video_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        heatmap_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        # --------------------------------------------------
        # Open video
        # --------------------------------------------------

        cap = cv2.VideoCapture(str(video_path))

        if not cap.isOpened():
            raise RuntimeError(
                f"Could not open video: {video_path}"
            )

        fps = cap.get(cv2.CAP_PROP_FPS)

        if fps <= 0:
            fps = 30.0

        width = int(
            cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        )

        height = int(
            cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        )

        total_frames = int(
            cap.get(cv2.CAP_PROP_FRAME_COUNT)
        )

        duration = (
            total_frames / fps
            if fps > 0
            else 0
        )

        print()
        print("Video information:")
        print(f"Resolution : {width} x {height}")
        print(f"FPS        : {fps:.2f}")
        print(f"Frames     : {total_frames}")
        print(f"Duration   : {duration:.2f} seconds")
        print()

        # --------------------------------------------------
        # Output video writer
        # --------------------------------------------------

        fourcc = cv2.VideoWriter_fourcc(
            *"mp4v"
        )

        writer = cv2.VideoWriter(
            str(output_video_path),
            fourcc,
            fps,
            (width, height)
        )

        if not writer.isOpened():
            cap.release()

            raise RuntimeError(
                "Could not create output video."
            )

        # --------------------------------------------------
        # Event engine
        # --------------------------------------------------

        event_engine = FlagEventEngine(
            fps=fps,
            max_gap_frames=5
        )

        # --------------------------------------------------
        # Statistics
        # --------------------------------------------------

        statistics = StatisticsCalculator()

        # --------------------------------------------------
        # Heatmap detection centers
        # --------------------------------------------------

        detection_centers = []

        frame_number = 0

        print("Starting video processing...")
        print()

        try:

            while True:

                success, frame = cap.read()

                if not success:
                    break

                frame_number += 1

                # ==================================================
                # 1. Constructor detection + ByteTrack
                # ==================================================

                constructor_detections = self.tracker.track(
                    frame,
                    confidence=0.50
                )

                # Add detections to statistics
                statistics.add_constructor_detections(
                    constructor_detections
                )

                # ==================================================
                # 2. Collect bbox centers for heatmap
                # ==================================================

                for detection in constructor_detections:

                    bbox = detection["bbox"]

                    x1, y1, x2, y2 = bbox

                    center_x = (
                        x1 + x2
                    ) / 2

                    center_y = (
                        y1 + y2
                    ) / 2

                    detection_centers.append(
                        (
                            center_x,
                            center_y
                        )
                    )

                # ==================================================
                # 3. Flag detection
                # ==================================================

                flag_detections = self.flag_detector.detect(
                    frame,
                    confidence=0.50
                )

                # ==================================================
                # 4. Update event engine
                # ==================================================

                event_engine.update(
                    frame_number,
                    flag_detections
                )

                # ==================================================
                # 5. Draw constructor detections
                # ==================================================

                for detection in constructor_detections:

                    x1, y1, x2, y2 = map(
                        int,
                        detection["bbox"]
                    )

                    constructor = detection[
                        "constructor"
                    ]

                    confidence = detection[
                        "confidence"
                    ]

                    track_id = detection[
                        "track_id"
                    ]

                    label = (
                        f"{constructor} "
                        f"ID:{track_id} "
                        f"{confidence:.2f}"
                    )

                    # Bounding box
                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 0),
                        2
                    )

                    # Label background
                    (text_width, text_height), _ = (
                        cv2.getTextSize(
                            label,
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            1
                        )
                    )

                    cv2.rectangle(
                        frame,
                        (
                            x1,
                            max(
                                0,
                                y1 - text_height - 8
                            )
                        ),
                        (
                            x1 + text_width + 4,
                            y1
                        ),
                        (0, 255, 0),
                        -1
                    )

                    cv2.putText(
                        frame,
                        label,
                        (
                            x1 + 2,
                            y1 - 5
                        ),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 0, 0),
                        1,
                        cv2.LINE_AA
                    )

                # ==================================================
                # 6. Draw flag detections
                # ==================================================

                for detection in flag_detections:

                    x1, y1, x2, y2 = map(
                        int,
                        detection["bbox"]
                    )

                    flag_name = detection[
                        "flag"
                    ]

                    confidence = detection[
                        "confidence"
                    ]

                    label = (
                        f"{flag_name} "
                        f"{confidence:.2f}"
                    )

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 255, 255),
                        2
                    )

                    cv2.putText(
                        frame,
                        label,
                        (x1, max(20, y1 - 5)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        (0, 255, 255),
                        2,
                        cv2.LINE_AA
                    )

                # ==================================================
                # 7. Draw processing information
                # ==================================================

                current_time = (
                    frame_number / fps
                )

                timestamp = self.format_timestamp(
                    current_time
                )

                info = (
                    f"Frame: {frame_number}/{total_frames} "
                    f"| Time: {timestamp}"
                )

                cv2.putText(
                    frame,
                    info,
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA
                )

                # ==================================================
                # 8. Write processed frame
                # ==================================================

                writer.write(frame)

                # ==================================================
                # 9. Progress
                # ==================================================

                if (
                    frame_number % 100 == 0
                    or frame_number == total_frames
                ):

                    percentage = (
                        frame_number /
                        total_frames *
                        100
                        if total_frames > 0
                        else 0
                    )

                    print(
                        f"\rProcessing: "
                        f"{frame_number}/{total_frames} "
                        f"({percentage:.1f}%)",
                        end=""
                    )

        finally:

            cap.release()
            writer.release()

        print()
        print()
        print("Video processing completed.")

        # --------------------------------------------------
        # Finish remaining flag events
        # --------------------------------------------------

        events = event_engine.finalize()

        statistics.add_flag_events(
            events
        )

        # --------------------------------------------------
        # Calculate statistics
        # --------------------------------------------------

        stats = statistics.calculate()

        # --------------------------------------------------
        # Generate heatmap
        # --------------------------------------------------

        print("Generating detection-density heatmap...")

        generate_heatmap(
            detection_centers=detection_centers,
            width=width,
            height=height,
            output_path=str(heatmap_path)
        )

        print(
            f"Heatmap saved: {heatmap_path}"
        )

        # --------------------------------------------------
        # Final result
        # --------------------------------------------------

        result = {
            "video": {
                "filename": video_path.name,
                "duration": round(duration, 2),
                "frames_processed": frame_number,
                "fps": round(fps, 2),
                "width": width,
                "height": height
            },

            "statistics": {
                "total_detections":
                    stats["total_detections"],

                "total_cars":
                    stats["total_cars"],

                "total_events":
                    stats["total_events"],

                "average_confidence":
                    stats["average_confidence"]
            },

            "constructors":
                stats["constructors"],

            "events":
                events,

            "heatmap":
                str(heatmap_path),

            "analyzed_video":
                str(output_video_path)
        }

        return result

    @staticmethod
    def format_timestamp(seconds: float):
        """
        Convert seconds to MM:SS.
        """

        total_seconds = int(seconds)

        minutes = total_seconds // 60
        seconds = total_seconds % 60

        return (
            f"{minutes:02d}:"
            f"{seconds:02d}"
        )