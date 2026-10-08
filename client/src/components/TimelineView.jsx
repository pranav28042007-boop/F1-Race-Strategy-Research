import React from 'react';
import { Clock, PlayCircle } from 'lucide-react';

export default function TimelineView({ timeline = [], onSeekTo }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col items-center justify-center text-center h-48 text-gray-500 font-mono text-xs">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        No chronological timeline events logged.
      </div>
    );
  }

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Chronological Event Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          <strong className="text-white">{timeline.length}</strong> MILESTONES
        </span>
      </div>

      {/* Timeline items list */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
        {timeline.map((item, index) => {
          const isFlag = item.type === 'flag_event' || item.label.toLowerCase().includes('flag') || item.label.toLowerCase().includes('vsc') || item.label.toLowerCase().includes('safety');

          return (
            <div
              key={index}
              onClick={() => onSeekTo && onSeekTo(item.time, item.label)}
              className="relative group cursor-pointer"
            >
              {/* Dot on the vertical line */}
              <div
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[#121722] transition-transform group-hover:scale-125 ${
                  isFlag ? 'bg-amber-400' : 'bg-red-500'
                }`}
              />

              <div className="bg-[#0B0E14] border border-gray-800 rounded p-2.5 hover:border-gray-700 transition flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                    {item.timestamp}
                  </span>
                  <span className="text-xs font-mono text-gray-200 font-medium group-hover:text-white transition">
                    {item.label}
                  </span>
                </div>

                {onSeekTo && (
                  <button
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition"
                    title={`Seek video to ${item.timestamp}`}
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
