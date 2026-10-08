from ultralytics import YOLO


class ConstructorTracker:
    def __init__(self, model_path: str):
        """
        YOLO model with persistent ByteTrack tracking.
        """

        self.model = YOLO(model_path)

        self.class_names = self.model.names

        print(f"Tracker model loaded: {model_path}")

    def track(self, frame, confidence: float = 0.25):
        """
        Run YOLO + ByteTrack on one video frame.

        Returns:
        [
            {
                "track_id": 3,
                "class_id": 2,
                "constructor": "Ferrari",
                "confidence": 0.92,
                "bbox": [x1, y1, x2, y2]
            }
        ]
        """

        results = self.model.track(
            source=frame,
            persist=True,
            tracker="bytetrack.yaml",
            conf=confidence,
            verbose=False
        )

        detections = []

        if not results:
            return detections

        result = results[0]

        if result.boxes is None:
            return detections

        # ByteTrack IDs are stored here
        if result.boxes.id is None:
            return detections

        track_ids = result.boxes.id.int().cpu().tolist()
        class_ids = result.boxes.cls.int().cpu().tolist()
        confidences = result.boxes.conf.cpu().tolist()
        boxes = result.boxes.xyxy.cpu().tolist()

        for track_id, class_id, conf, bbox in zip(
            track_ids,
            class_ids,
            confidences,
            boxes
        ):
            detections.append({
                "track_id": int(track_id),
                "class_id": int(class_id),
                "constructor": self.class_names[int(class_id)],
                "confidence": float(conf),
                "bbox": [
                    float(bbox[0]),
                    float(bbox[1]),
                    float(bbox[2]),
                    float(bbox[3])
                ]
            })

        return detections