from pathlib import Path
from ultralytics import YOLO


class ConstructorDetector:
    def __init__(self, model_path: str):
        """
        Load the trained constructor YOLO model.
        """

        self.model_path = Path(model_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Constructor model not found: {self.model_path}"
            )

        self.model = YOLO(str(self.model_path))

        # Get class names directly from the trained model
        self.class_names = self.model.names

        print(f"Constructor model loaded: {self.model_path}")
        print(f"Classes: {self.class_names}")

    def detect(self, frame, confidence: float = 0.25):
        """
        Run constructor detection on a single OpenCV frame.

        Returns:
        [
            {
                "class_id": 2,
                "constructor": "Ferrari",
                "confidence": 0.91,
                "bbox": [x1, y1, x2, y2]
            }
        ]
        """

        results = self.model.predict(
            source=frame,
            conf=confidence,
            verbose=False
        )

        detections = []

        if not results:
            return detections

        result = results[0]

        if result.boxes is None:
            return detections

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence_score = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class_id": class_id,
                "constructor": self.class_names[class_id],
                "confidence": confidence_score,
                "bbox": [
                    float(x1),
                    float(y1),
                    float(x2),
                    float(y2)
                ]
            })

        return detections