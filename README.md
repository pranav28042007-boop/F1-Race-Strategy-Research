# 🏎️ AI-Based Formula 1 Visual Race Intelligence System

An AI-powered Formula 1 race video analysis system that uses computer vision to automatically detect F1 cars, identify constructors, detect race-control flags, track vehicles, and generate visual race-analysis results.

## 🚀 Features

- 🏎️ F1 car and constructor detection
- 🚩 Race-control flag detection
- 🎯 Multi-object tracking using ByteTrack
- 📊 Constructor detection statistics
- 🚩 Flag event detection
- 🎥 AI-annotated race videos
- 🔥 Detection-density heatmaps
- 🌐 MERN-based web application
- 🤖 FastAPI-based AI service
- 🎞️ Automatic browser-compatible video conversion using FFmpeg

## 🧠 AI Models

| Model | Task |
|---|---|
| YOLOv8 | Initial Constructor Detection |
| YOLO11n | Final Constructor Detection |
| YOLO11s | Flag Detection |
| ByteTrack | Multi-object Tracking |

### Final Models

- **Constructor Detection:** YOLO11n
- **Flag Detection:** YOLO11s
- **Object Tracking:** ByteTrack

## 📊 Model Performance

| Model | Task | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---:|---:|---:|---:|
| YOLOv8 | Constructor Detection | 96.74% | 92.82% | 95.19% | 82.82% |
| YOLO11n | Constructor Detection | 95.15% | 93.31% | 95.28% | 83.39% |
| YOLO11s | Flag Detection | 93.68% | 96.28% | 95.43% | 65.49% |

## 🛠️ Technologies

- Python
- YOLOv8
- YOLO11
- OpenCV
- ByteTrack
- FastAPI
- React
- Node.js
- Express.js
- MongoDB
- FFmpeg

## 🏗️ Architecture

```text
F1 Race Video
      ↓
React Frontend
      ↓
Express.js Backend
      ↓
FastAPI AI Service
      ↓
YOLO11n + YOLO11s + ByteTrack
      ↓
OpenCV Video Processing
      ↓
Detection & Tracking Results
      ↓
MongoDB + Annotated Video
      ↓
React Dashboard