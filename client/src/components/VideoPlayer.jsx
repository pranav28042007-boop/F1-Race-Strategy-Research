import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Crosshair } from 'lucide-react';
import { formatDuration } from '../services/api';

const VideoPlayer = forwardRef(({ videoUrl, title = 'Analyzed Race Video', duration = 0 }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(false);
  const [seekNotice, setSeekNotice] = useState(null);

  // Expose imperative methods to parent (e.g. Dashboard)
  useImperativeHandle(ref, () => ({
    seekTo: (seconds, label = '') => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (label) {
          setSeekNotice(`JUMPED TO ${formatDuration(seconds)}: ${label}`);
          setTimeout(() => setSeekNotice(null), 3000);
        }
      }
    },
    getCurrentTime: () => currentTime
  }));

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const resetVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg overflow-hidden flex flex-col">
      {/* Video Telemetry Header */}
      <div className="px-4 py-2.5 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-gray-300 font-bold uppercase tracking-wider">{title}</span>
          <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
            CV OVERLAY ACTIVE
          </span>
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Crosshair className="w-3.5 h-3.5 text-red-500" />
            <span>TRACKING ACTIVE</span>
          </div>
          <span className="text-white font-semibold">
            {formatDuration(currentTime)} / {formatDuration(videoDuration || duration)}
          </span>
        </div>
      </div>

      {/* Video Screen Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Floating Jump Notice */}
        {seekNotice && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/95 text-white font-mono text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-red-400/40 animate-bounce flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {seekNotice}
          </div>
        )}

        {/* Center Play Button Overlay if paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-red-600 transition"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="p-3 bg-gray-900/90 border-t border-gray-800 flex flex-col gap-2">
        {/* Scrubber / Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 w-10">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={videoDuration || duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition"
          />
          <span className="text-[11px] font-mono text-gray-400 w-10 text-right">
            {formatDuration(videoDuration || duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded hover:bg-gray-800 hover:text-white transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={resetVideo}
              className="p-1.5 rounded hover:bg-gray-800 hover:text-white transition"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded hover:bg-gray-800 hover:text-white transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-gray-400">
              FRAME: <span className="text-white font-bold">{Math.round(currentTime * 30)}</span>
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-gray-800 hover:text-white transition"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
