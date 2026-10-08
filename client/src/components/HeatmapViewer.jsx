import React, { useState } from 'react';
import { Flame, Info, Maximize2, X } from 'lucide-react';
import { getMediaUrl } from '../services/api';

export default function HeatmapViewer({ heatmapPath }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fullUrl = getMediaUrl(heatmapPath);

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Detection Density Heatmap
            </h3>
          </div>
          {heatmapPath && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition"
              title="Expand heatmap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Disclaimer Note - Critical requirement from Section 15 */}
        <div className="bg-blue-950/20 border border-blue-900/40 rounded p-2.5 mb-3 flex items-start space-x-2 text-[11px] font-mono text-blue-300">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Spatial Object Density (BBox Centers):</strong> Displays 2D spatial concentration of detected objects across video frame pixel coordinates. <em>Not physical GPS circuit geometry.</em>
          </p>
        </div>
      </div>

      {/* Heatmap Image Container */}
      <div className="relative aspect-video bg-black/60 rounded border border-gray-800/80 overflow-hidden flex items-center justify-center group cursor-pointer"
        onClick={() => heatmapPath && setIsModalOpen(true)}
      >
        {heatmapPath ? (
          <>
            <img
              src={fullUrl}
              alt="F1 Object Detection Density Heatmap"
              className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <span className="bg-gray-900/90 text-white text-xs font-mono px-3 py-1.5 rounded border border-gray-700 flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" />
                Click to Enlarge
              </span>
            </div>
          </>
        ) : (
          <div className="text-gray-500 font-mono text-xs flex flex-col items-center">
            <Flame className="w-8 h-8 opacity-40 mb-2" />
            Heatmap processing pending or unavailable.
          </div>
        )}
      </div>

      {/* Modal for Full Resolution Heatmap */}
      {isModalOpen && heatmapPath && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#121722] border border-gray-700 rounded-lg p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Detection Density Heatmap — Full Resolution
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black rounded">
              <img
                src={fullUrl}
                alt="Enlarged Heatmap"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="mt-3 text-[11px] font-mono text-gray-400 text-center">
              Bounding-box center distribution accumulated across processed video frames.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
