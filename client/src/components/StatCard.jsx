import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, description, accentColor = '#E10600' }) {
  return (
    <div className="bg-[#121722] border border-gray-800 rounded-lg p-4 relative overflow-hidden group hover:border-gray-700 transition">
      {/* Accent Top Border Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-0.5 opacity-80 group-hover:opacity-100 transition" 
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
          {title}
        </span>
        {Icon && (
          <div 
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-800/60"
            style={{ color: accentColor }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold font-display text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-gray-400 font-normal">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-[11px] text-gray-400 font-mono flex items-center gap-1">
          {description}
        </p>
      )}
    </div>
  );
}
