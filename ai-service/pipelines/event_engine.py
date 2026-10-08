from collections import defaultdict


class FlagEventEngine:
    def __init__(self, fps: float, max_gap_frames: int = 5):
        """
        Group consecutive flag detections into events.

        fps:
            Video frames per second.

        max_gap_frames:
            Number of frames allowed to be missing before
            an event is considered finished.
        """

        self.fps = fps
        self.max_gap_frames = max_gap_frames

        self.active_events = {}
        self.completed_events = []

    def update(self, frame_number: int, detections: list):
        """
        Process flag detections from one video frame.

        detections example:
        [
            {
                "class_id": 0,
                "flag": "Yellow",
                "confidence": 0.94,
                "bbox": [100, 50, 200, 150]
            }
        ]
        """

        current_flags = set()

        for detection in detections:
            flag_name = detection["flag"]
            confidence = detection["confidence"]

            current_flags.add(flag_name)

            # Start a new event
            if flag_name not in self.active_events:

                self.active_events[flag_name] = {
                    "event_type": flag_name,
                    "start_frame": frame_number,
                    "last_frame": frame_number,
                    "max_confidence": confidence,
                    "confidence_sum": confidence,
                    "detection_count": 1
                }

            else:
                # Continue existing event
                event = self.active_events[flag_name]

                event["last_frame"] = frame_number
                event["max_confidence"] = max(
                    event["max_confidence"],
                    confidence
                )

                event["confidence_sum"] += confidence
                event["detection_count"] += 1

        # Check active events that disappeared
        events_to_close = []

        for flag_name, event in self.active_events.items():

            if flag_name not in current_flags:

                gap = frame_number - event["last_frame"]

                if gap > self.max_gap_frames:
                    events_to_close.append(flag_name)

        # Finalize disappeared events
        for flag_name in events_to_close:
            self._finish_event(flag_name)

    def _finish_event(self, flag_name: str):
        """
        Convert an active event into the final dashboard format.
        """

        event = self.active_events.pop(flag_name)

        start_frame = event["start_frame"]
        end_frame = event["last_frame"]

        start_time = start_frame / self.fps
        end_time = end_frame / self.fps

        duration = max(0, end_time - start_time)

        average_confidence = (
            event["confidence_sum"] /
            event["detection_count"]
        )

        completed_event = {
            "event_type": event["event_type"],

            "start_time": round(start_time, 2),
            "end_time": round(end_time, 2),

            "start_timestamp": self._format_timestamp(
                start_time
            ),

            "end_timestamp": self._format_timestamp(
                end_time
            ),

            "duration": round(duration, 2),

            "confidence": round(
                average_confidence,
                3
            )
        }

        self.completed_events.append(completed_event)

    def finalize(self):
        """
        Finish all events still active at the end of the video.

        Must be called after the final video frame.
        """

        for flag_name in list(self.active_events.keys()):
            self._finish_event(flag_name)

        return self.completed_events

    @staticmethod
    def _format_timestamp(seconds: float):
        """
        Convert seconds into MM:SS format.
        """

        total_seconds = int(seconds)

        minutes = total_seconds // 60
        seconds = total_seconds % 60

        return f"{minutes:02d}:{seconds:02d}"