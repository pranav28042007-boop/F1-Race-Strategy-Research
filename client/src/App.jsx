import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800/80 bg-[#0B0E14] py-8 text-xs font-mono text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span className="text-gray-400 font-bold tracking-wider uppercase">
            F1 Visual Race Intelligence System
          </span>
          <span>•</span>
          <span>FullStack AI Architecture</span>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <span>React + Vite</span>
          <span>•</span>
          <span>Express + Node</span>
          <span>•</span>
          <span>MongoDB</span>
          <span>•</span>
          <span className="text-red-400">FastAPI & YOLO Pipeline</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0B0E14] text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:id" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
