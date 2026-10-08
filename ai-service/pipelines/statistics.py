from collections import Counter


class StatisticsCalculator:
    def __init__(self):
        self.detections = []
        self.track_ids = set()
        self.events = []

    def add_constructor_detections(self, detections):
        """
        Add tracked constructor detections from one video frame.
        """

        for detection in detections:
            self.detections.append(detection)

            # Count unique physical cars using ByteTrack ID
            if "track_id" in detection:
                self.track_ids.add(detection["track_id"])

    def add_flag_events(self, events):
        """
        Store completed flag/sign events.
        """

        self.events = events

    def calculate(self):
        """
        Generate statistics for the dashboard.
        """

        total_detections = len(self.detections)

        # Unique cars detected by ByteTrack
        total_cars = len(self.track_ids)

        # Count detections for each constructor
        constructor_counts = Counter(
            detection["constructor"]
            for detection in self.detections
        )

        # Average detection confidence
        if total_detections > 0:
            average_confidence = (
                sum(
                    detection["confidence"]
                    for detection in self.detections
                )
                / total_detections
            )
        else:
            average_confidence = 0

        # Constructor statistics
        constructors = []

        for constructor, count in constructor_counts.items():

            percentage = (
                (count / total_detections) * 100
                if total_detections > 0
                else 0
            )

            constructors.append({
                "name": constructor,
                "detections": count,
                "percentage": round(percentage, 2)
            })

        # Highest detection count first
        constructors.sort(
            key=lambda x: x["detections"],
            reverse=True
        )

        return {
            "total_detections": total_detections,
            "total_cars": total_cars,
            "total_events": len(self.events),
            "average_confidence": round(
                average_confidence,
                3
            ),
            "constructors": constructors
        }