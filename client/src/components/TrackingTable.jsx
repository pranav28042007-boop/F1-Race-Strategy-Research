import React, { useState } from 'react';
import { Crosshair, Search, PlayCircle } from 'lucide-react';

export default function TrackingTable({ trackedObjects = [], onSeekTo }) {
  const [filter, setFilter] = useState('');

  const filteredObjects = trackedObjects.filter((item) => {
    const team = item.team || item.constructor_name || item.constructor || '';
    const trackId = String(item.track_id);
    const query = filter.toLowerCase();
    return team.toLowerCase().includes(query) || trackId.includes(query);
  });

  const parseTimestampToSeconds = (ts) => {
    if (!ts) return 0;
    const parts = ts.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Persistent Car Tracking (ByteTrack)
          </h3>
          <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
            {trackedObjects.length} TRACKS
          </span>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter track or team..."
            className="bg-[#0B0E14] border border-gray-700 rounded text-xs font-mono pl-8 pr-3 py-1 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition w-44"
          />
        </div>
      </div>

      {/* Tracking Cards Grid */}
      {filteredObjects.length === 0 ? (
        <div className="py-8 text-center text-gray-500 font-mono text-xs">
          No tracked cars matching filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredObjects.map((item) => {
            const team = item.team || item.constructor_name || item.constructor || 'Unknown';
            const firstSeconds = parseTimestampToSeconds(item.first_detected);

            return (
              <div
                key={item.track_id}
                className="bg-[#0B0E14] border border-gray-800/80 rounded-md p-3 hover:border-gray-700 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded">
                      Track #{item.track_id}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      {Math.round((item.confidence > 1 ? item.confidence : item.confidence * 100))}% Conf
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white mb-2 font-display">
                    {team}
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-gray-400 border-t border-gray-900 pt-2">
                    <div className="flex justify-between">
                      <span>Frames Detected:</span>
                      <strong className="text-gray-200">{item.frames_detected}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>First Detected:</span>
                      <strong className="text-gray-200">{item.first_detected}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Detected:</span>
                      <strong className="text-gray-200">{item.last_detected}</strong>
                    </div>
                  </div>
                </div>

                {/* Seek Action button */}
                {onSeekTo && (
                  <button
                    onClick={() => onSeekTo(firstSeconds, `Track #${item.track_id} (${team})`)}
                    className="mt-3 w-full py-1.5 px-2 bg-gray-800/60 hover:bg-red-600/20 hover:text-red-400 text-gray-300 rounded text-[11px] font-mono flex items-center justify-center gap-1.5 transition border border-gray-700/60 hover:border-red-600/40"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Seek to First Frame ({item.first_detected})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
