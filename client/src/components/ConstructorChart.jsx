import React from 'react';
import { ShieldCheck, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Team colors fallback mapping (dynamic, works for any constructor list)
const DEFAULT_COLORS = [
  '#E80020', // Ferrari
  '#FF8000', // McLaren
  '#27F4D2', // Mercedes
  '#3671C6', // Red Bull
  '#229971', // Aston Martin
  '#FF87BC', // Alpine
  '#52E252', // Stake/Kick
  '#B6BABD', // Haas
  '#64C4FF', // Williams
  '#6692FF'  // RB / AlphaTauri
];

export default function ConstructorChart({ constructors = [] }) {
  if (!constructors || constructors.length === 0) {
    return (
      <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col items-center justify-center text-center h-64 text-gray-500 font-mono text-xs">
        <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
        No constructor detections available.
      </div>
    );
  }

  const sortedConstructors = [...constructors].sort((a, b) => b.detections - a.detections);
  const totalDetections = sortedConstructors.reduce((acc, c) => acc + (c.detections || 0), 0);

  // Prepare data for Recharts
  const chartData = sortedConstructors.map((c, index) => ({
    name: c.name,
    detections: c.detections,
    percentage: c.percentage || Math.round((c.detections / (totalDetections || 1)) * 100),
    color: c.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Constructor Detections
          </h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          TOTAL: <strong className="text-white">{totalDetections}</strong> DETECTIONS
        </span>
      </div>

      {/* Chart visualization */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0B0E14] border border-gray-700 p-2.5 rounded shadow-xl text-xs font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                        {data.name}
                      </div>
                      <div className="text-gray-300">
                        Detections: <span className="font-bold text-white">{data.detections}</span>
                      </div>
                      <div className="text-gray-400">
                        Share: <span className="text-red-400 font-bold">{data.percentage}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="detections" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Constructor Telemetry List with progress bars */}
      <div className="mt-4 space-y-2.5 border-t border-gray-800/80 pt-3">
        {chartData.map((c, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-gray-200 font-semibold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">{c.percentage}%</span>
                <span className="text-white font-bold">{c.detections} <span className="text-gray-500 font-normal">det</span></span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(3, c.percentage))}%`,
                  backgroundColor: c.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
