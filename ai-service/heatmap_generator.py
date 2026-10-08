import os

import cv2
import numpy as np


def generate_heatmap(
    detection_centers,
    width: int,
    height: int,
    output_path: str
) -> str:
    """
    Generate a real detection-density heatmap.

    detection_centers:
        List of (x, y) bounding-box center coordinates collected
        from YOLO detections across the video.

    This represents detection density in video-frame coordinates,
    NOT the physical GPS layout of the circuit.
    """

    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True
    )

    # Create empty density map
    heatmap = np.zeros(
        (height, width),
        dtype=np.float32
    )

    # Add every detected bounding-box center
    for x, y in detection_centers:

        x = int(x)
        y = int(y)

        if 0 <= x < width and 0 <= y < height:
            heatmap[y, x] += 1

    # Smooth the detection points
    heatmap = cv2.GaussianBlur(
        heatmap,
        (0, 0),
        sigmaX=25,
        sigmaY=25
    )

    # Normalize to 0-255
    normalized = cv2.normalize(
        heatmap,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    normalized = normalized.astype(np.uint8)

    # Apply OpenCV heatmap
    colored = cv2.applyColorMap(
        normalized,
        cv2.COLORMAP_JET
    )

    # Add a small title
    cv2.putText(
        colored,
        "SPATIAL OBJECT DETECTION DENSITY",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )

    cv2.putText(
        colored,
        "Video frame coordinate density - not GPS track geometry",
        (20, height - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )

    # Save
    cv2.imwrite(
        output_path,
        colored
    )

    return output_path