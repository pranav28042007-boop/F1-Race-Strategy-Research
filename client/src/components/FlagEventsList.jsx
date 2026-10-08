import React from 'react';
import { Flag, Play, AlertTriangle, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function FlagEventsList({ events = [], onSeekTo }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col items-center justify-center text-center h-48 text-gray-500 font-mono text-xs">
        <Flag className="w-8 h-8 mb-2 opacity-50" />
        No race control flag events detected.
      </div>
    );
  }

  const getEventBadge = (type) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('vsc')) {
      return {
        bg: 'bg-amber-950/40 text-amber-400 border-amber-600/40',
        badge: 'bg-amber-500 text-black',
        icon: AlertTriangle,
        label: 'VSC'
      };
    }
    if (lower.includes('yellow')) {
      return {
        bg: 'bg-yellow-950/40 text-yellow-300 border-yellow-600/40',
        badge: 'bg-yellow-400 text-black',
        icon: AlertTriangle,
        label: 'YELLOW FLAG'
      };
    }
    if (lower.includes('green')) {
      return {
        bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40',
        badge: 'bg-emerald-500 text-black',
        icon: CheckCircle2,
        label: 'GREEN FLAG'
      };
    }
    if (lower.includes('safety') || lower.includes('sc')) {
      return {
        bg: 'bg-orange-950/40 text-orange-400 border-orange-600/40',
        badge: 'bg-orange-500 text-black',
        icon: ShieldAlert,
        label: 'SAFETY CAR'
      };
    }
    if (lower.includes('red')) {
      return {
        bg: 'bg-red-950/50 text-red-400 border-red-600/50',
        badge: 'bg-red-600 text-white',
        icon: AlertOctagon,
        label: 'RED FLAG'
      };
    }
    return {
      bg: 'bg-blue-950/40 text-blue-300 border-blue-600/40',
      badge: 'bg-blue-500 text-white',
      icon: Flag,
      label: type.toUpperCase()
    };
  };

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
        <div className="flex items-center space-x-2">
          <Flag className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Race Control Flag & Sign Events
          </h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          <strong className="text-white">{events.length}</strong> GROUPED EVENTS
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((evt, idx) => {
          const style = getEventBadge(evt.event_type);
          const Icon = style.icon;
          const confPercent = Math.round((evt.confidence > 1 ? evt.confidence : evt.confidence * 100));

          return (
            <div
              key={idx}
              onClick={() => onSeekTo && onSeekTo(evt.start_time, evt.event_type)}
              className={`p-3.5 rounded-lg border ${style.bg} hover:border-white/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm`}
            >
              <div className="flex items-start sm:items-center space-x-3">
                <div className={`px-2.5 py-1 rounded text-xs font-black font-mono tracking-tight flex items-center gap-1.5 ${style.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {evt.event_type}
                </div>

                <div>
                  <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <span>{evt.start_timestamp}</span>
                    <span className="text-gray-400">→</span>
                    <span>{evt.end_timestamp}</span>
                  </div>
                  {evt.description && (
                    <p className="text-[11px] text-gray-300 font-mono mt-0.5">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs font-mono">
                <div className="text-right">
                  <div className="text-gray-400 text-[10px] uppercase">Duration</div>
                  <div className="text-white font-bold">{evt.duration} sec</div>
                </div>

                <div className="text-right">
                  <div className="text-gray-400 text-[10px] uppercase">Confidence</div>
                  <div className="text-emerald-400 font-bold">{confPercent}%</div>
                </div>

                {onSeekTo && (
                  <button
                    className="p-1.5 rounded-full bg-gray-800 text-gray-300 group-hover:bg-red-600 group-hover:text-white transition"
                    title={`Seek video to ${evt.start_timestamp}`}
                    aria-label={`Seek video to ${evt.start_timestamp}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
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
