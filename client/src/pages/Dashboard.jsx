import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Cpu,
  ShieldAlert,
  Car,
  Flag,
  Share2,
  AlertCircle,
  FileVideo
} from 'lucide-react';
import { getAnalysisById, getMediaUrl, formatDuration, formatFileSize } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import StatCard from '../components/StatCard';
import ConstructorChart from '../components/ConstructorChart';
import TrackingTable from '../components/TrackingTable';
import FlagEventsList from '../components/FlagEventsList';
import TimelineView from '../components/TimelineView';
import HeatmapViewer from '../components/HeatmapViewer';

export default function Dashboard() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reference to VideoPlayer component for timestamp seeking
  const videoPlayerRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAnalysisById(id);
        if (res.success && res.data) {
          setAnalysis(res.data);
        } else {
          throw new Error('Analysis record not found');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load analysis record.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysisData();
    }
  }, [id]);

  // Handler for seeking video when user clicks any flag event or timeline milestone
  const handleSeekToTime = (seconds, label = '') => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(seconds, label);
      // Smoothly scroll up if the user is further down the dashboard
      if (videoContainerRef.current) {
        videoContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-white font-display">Loading Race Intelligence Telemetry</h3>
        <p className="text-xs font-mono text-gray-400 mt-1">Fetching analysis record #{id}</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-950/30 border border-red-800/80 rounded-xl p-8 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white font-display mb-2">Analysis Record Error</h2>
          <p className="text-xs text-gray-300 font-mono mb-6">{error || 'Record does not exist'}</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-mono font-bold uppercase transition"
            >
              Upload New Video
            </Link>
            <Link
              to="/history"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-mono font-bold uppercase transition"
            >
              Browse History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics values
  const stats = analysis.statistics || {};
  const totalCars = stats.total_cars || analysis.totalCars || 0;
  const totalConstructors = (analysis.constructors || []).length;
  const totalEvents = stats.total_events || analysis.totalEvents || (analysis.events || []).length;
  const durationSec = analysis.duration || 0;
  const framesProcessed = stats.frames_processed || analysis.framesProcessed || Math.round(durationSec * 30);
  const avgConfidence = stats.average_confidence || analysis.averageConfidence || 0;
  const formattedConfidence = `${((avgConfidence > 1 ? avgConfidence : avgConfidence * 100)).toFixed(1)}%`;

  const videoUrl = getMediaUrl(analysis.analyzedVideoPath || analysis.originalVideoPath);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 mb-1">
            <Link to="/history" className="hover:text-white flex items-center gap-1 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to History</span>
            </Link>
            <span>/</span>
            <span className="text-red-400 font-bold uppercase">Session #{id.slice(-6)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {analysis.videoName}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              {analysis.status}
            </span>
          </div>
        </div>

        {/* Date & Quick Meta */}
        <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {analysis.fileSize > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <FileVideo className="w-3.5 h-3.5 text-gray-500" />
              <span>{formatFileSize(analysis.fileSize)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. TOP SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          title="Total Cars"
          value={totalCars}
          icon={Car}
          accentColor="#E10600"
          description="Detected race cars"
        />
        <StatCard
          title="Teams"
          value={totalConstructors}
          icon={ShieldAlert}
          accentColor="#FF8700"
          description="Constructors identified"
        />
        <StatCard
          title="Flag Events"
          value={totalEvents}
          icon={Flag}
          accentColor="#FFDE00"
          description="VSC & caution events"
        />
        <StatCard
          title="Duration"
          value={formatDuration(durationSec)}
          unit="min"
          icon={Clock}
          accentColor="#00D2BE"
          description={`${durationSec} total seconds`}
        />
        <StatCard
          title="Frames"
          value={framesProcessed.toLocaleString()}
          icon={Layers}
          accentColor="#3B82F6"
          description="Video frames analyzed"
        />
        <StatCard
          title="Confidence"
          value={formattedConfidence}
          icon={Cpu}
          accentColor="#10B981"
          description="Model detection avg"
        />
      </div>

      {/* 2. MAIN MEDIA & SPATIAL DENSITY SECTION */}
      <div ref={videoContainerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Video Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <VideoPlayer
            ref={videoPlayerRef}
            videoUrl={videoUrl}
            title={analysis.videoName}
            duration={durationSec}
          />
        </div>

        {/* Right: Spatial Detection Density Heatmap (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <HeatmapViewer heatmapPath={analysis.heatmapPath} />
        </div>
      </div>

      {/* 3. CONSTRUCTORS & FLAG EVENTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Constructor Detections Breakdown (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <ConstructorChart constructors={analysis.constructors || []} />
        </div>

        {/* Race Control Flag & Sign Events (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <FlagEventsList
            events={analysis.events || []}
            onSeekTo={handleSeekToTime}
          />
        </div>
      </div>

      {/* 4. EVENT TIMELINE & CAR TRACKING ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chronological Event Timeline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <TimelineView
            timeline={analysis.timeline || []}
            onSeekTo={handleSeekToTime}
          />
        </div>

        {/* Persistent Car Tracking Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <TrackingTable
            trackedObjects={analysis.trackedObjects || []}
            onSeekTo={handleSeekToTime}
          />
        </div>
      </div>
    </div>
  );
}
