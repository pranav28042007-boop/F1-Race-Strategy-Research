import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileVideo,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  History as HistoryIcon
} from 'lucide-react';
import { uploadAndAnalyze, getAllAnalyses, formatDuration, formatFileSize } from '../services/api';

const PIPELINE_STEPS = [
  { label: 'Uploading race video to Express backend...', duration: 15 },
  { label: 'Dispatching stream to FastAPI AI service...', duration: 35 },
  { label: 'Running object detection & ByteTrack inference...', duration: 65 },
  { label: 'Grouping flag events & generating spatial heatmap...', duration: 85 },
  { label: 'Saving telemetry analysis to MongoDB...', duration: 95 }
];

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Fetch recent analyses for quick access
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await getAllAnalyses();
        if (res.success && res.data) {
          setRecentAnalyses(res.data.slice(0, 3));
        }
      } catch (err) {
        // quiet error on initial mount
      }
    };
    fetchRecent();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    const validExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.m4v'];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt && !selectedFile.type.startsWith('video/')) {
      setError(`Invalid file format. Please select a video file (${validExtensions.join(', ')}).`);
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File size exceeds the 500MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const startAnalysis = async (fileToUpload = file) => {
    if (!fileToUpload) {
      setError('Please select a video file first.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(10);
    setCurrentStepIndex(0);

    // Multi-stage visual step timer simulation for smooth UX
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2200);

    try {
      const result = await uploadAndAnalyze(fileToUpload, (progress) => {
        setUploadProgress(progress);
      });

      clearInterval(stepInterval);
      setUploadProgress(100);

      if (result.success && result.data && result.data._id) {
        setTimeout(() => {
          navigate(`/analysis/${result.data._id}`);
        }, 600);
      } else {
        throw new Error('Analysis completed but no valid ID returned.');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to upload and analyze video. Make sure backend and FastAPI are running.'
      );
    }
  };

  // Quick Demo Trigger
  const handleQuickDemo = async () => {
    try {
      setError(null);
      setIsUploading(true);
      setCurrentStepIndex(0);

      // Create a dummy File object using standard blob or fetch the demo file
      const response = await fetch('http://localhost:5000/uploads/videos/demo.mp4');
      let demoFile;
      if (response.ok) {
        const blob = await response.blob();
        demoFile = new File([blob], 'f1_demo_telemetry.mp4', { type: 'video/mp4' });
      } else {
        // Fallback: create mock blob
        demoFile = new File(['mock video stream content'], 'f1_demo_telemetry.mp4', { type: 'video/mp4' });
      }

      setFile(demoFile);
      await startAnalysis(demoFile);
    } catch (err) {
      setIsUploading(false);
      setError(`Demo trigger failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/50 text-red-400 text-xs font-mono font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Computer Vision Telemetry Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
          F1 Visual Race Intelligence System
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-400 font-sans max-w-2xl mx-auto">
          Upload on-board or broadcast race footage to detect constructors, track persistent car paths,
          aggregate flag events, and compute frame spatial detection-density heatmaps.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs font-mono flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error:</span> {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Box Container */}
      <div className="bg-[#121722] border border-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {!isUploading ? (
          <div>
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition cursor-pointer ${
                dragActive
                  ? 'border-red-500 bg-red-950/20'
                  : file
                  ? 'border-emerald-600/60 bg-emerald-950/10'
                  : 'border-gray-700/80 hover:border-gray-600 bg-[#0B0E14]/60'
              }`}
              onClick={() => document.getElementById('video-input')?.click()}
            >
              <input
                id="video-input"
                type="file"
                accept="video/*,.mp4,.avi,.mov,.mkv,.webm"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/80 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                {file ? file.name : 'Choose an F1 race video or drag & drop'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Supports MP4, AVI, MOV, MKV up to 500MB
              </p>

              {file && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-800/80 border border-gray-700 text-xs font-mono text-gray-200">
                  <FileVideo className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Size: {formatFileSize(file.size)}</span>
                  <span className="text-emerald-400">✓ Ready for processing</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
              {/* Quick Demo Test CTA */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-gray-700 transition"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>Test with Sample F1 Video</span>
              </button>

              {/* Start Analysis Button */}
              <button
                type="button"
                onClick={() => startAnalysis(file)}
                disabled={!file}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition ${
                  file
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Start AI Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Processing State View */
          <div className="py-12 px-4 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
              <FileVideo className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-1">
              Processing Race Video Intelligence
            </h3>
            <p className="text-xs text-gray-400 font-mono mb-6">
              Executing multi-stage analysis pipeline (Express → FastAPI → MongoDB)
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-6">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, uploadProgress)}%` }}
              />
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="space-y-2 text-left bg-[#0B0E14] border border-gray-800/80 rounded-lg p-3.5">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2.5 text-xs font-mono transition ${
                      isCurrent
                        ? 'text-white font-bold'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-700" />
                    )}
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Analyses Quick Jump */}
      {recentAnalyses.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <HistoryIcon className="w-3.5 h-3.5 text-red-500" />
              Recent Race Analyses
            </h3>
            <Link
              to="/history"
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 transition"
            >
              <span>View all ({recentAnalyses.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAnalyses.map((item) => (
              <Link
                key={item._id}
                to={`/analysis/${item._id}`}
                className="bg-[#121722] border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded uppercase">
                      {item.status}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                      {formatDuration(item.duration)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">
                    {item.videoName}
                  </h4>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>{item.totalDetections} det</span>
                  <span>{item.totalEvents} events</span>
                  <span className="text-white font-bold group-hover:translate-x-0.5 transition">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
