import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Database, Cpu, UploadCloud, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [health, setHealth] = useState({
    server: false,
    database: false,
    aiService: false,
    mockMode: true,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await getHealth();
        setHealth({
          server: data.status === 'ok',
          database: data.database?.status === 'connected',
          aiService: data.aiService?.status === 'online',
          mockMode: data.aiService?.mock_mode ?? true,
        });
      } catch (err) {
        setHealth({
          server: false,
          database: false,
          aiService: false,
          mockMode: true,
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md group-hover:bg-red-700 transition">
              F1
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider uppercase text-white font-display flex items-center gap-1.5">
                VISUAL RACE INTELLIGENCE
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60">
                  SYSTEM
                </span>
              </span>
              <p className="text-[11px] text-gray-400 font-mono tracking-tight -mt-0.5">
                YOLO & Telemetry Video Analysis Engine
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Video</span>
            </Link>

            <Link
              to="/history"
              className={`px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition ${
                isActive('/history')
                  ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Race History</span>
            </Link>
          </nav>

          {/* System Telemetry & Status Badges */}
          <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono">
            {/* AI Service Status */}
            <div
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 border ${
                health.aiService
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-red-950/40 text-red-400 border-red-800/50'
              }`}
              title={health.aiService ? 'FastAPI AI Service Online' : 'FastAPI AI Service Offline'}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI SERVICE</span>
              <span className={`w-1.5 h-1.5 rounded-full ${health.aiService ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            </div>

            {/* MongoDB Status */}
            <div
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 border ${
                health.database
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
              }`}
              title={health.database ? 'MongoDB Connected' : 'MongoDB Disconnected'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>MONGO</span>
              <span className={`w-1.5 h-1.5 rounded-full ${health.database ? 'bg-emerald-400' : 'bg-amber-500'}`} />
            </div>

            {/* Mock Mode Tag */}
            {health.mockMode && (
              <div className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-800/50 text-[10px]">
                MOCK AI MODE
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
