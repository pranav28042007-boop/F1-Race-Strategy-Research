import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Car,
  Flag,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getAllAnalyses, deleteAnalysis, formatDuration, formatFileSize } from '../services/api';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllAnalyses();
      if (res.success && res.data) {
        setAnalyses(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((item) => item._id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  const filteredAnalyses = analyses.filter((item) => {
    const query = search.toLowerCase();
    const name = (item.videoName || '').toLowerCase();
    return name.includes(query) || (item.status || '').toLowerCase().includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-red-500 font-bold uppercase mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Telemetry Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Race Analysis History
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Browse previous race sessions stored in MongoDB ({analyses.length} total)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search session or video..."
              className="bg-[#121722] border border-gray-700 rounded-lg text-xs font-mono pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition w-56 sm:w-64"
            />
          </div>

          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs font-mono mb-6 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-gray-400">Loading race session records...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        /* Empty State */
        <div className="bg-[#121722] border border-gray-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-60" />
          <h3 className="text-base font-bold text-white font-display mb-1">
            {search ? 'No matching race analyses found' : 'No race analyses recorded yet'}
          </h3>
          <p className="text-xs text-gray-400 font-mono mb-6">
            {search ? 'Try clearing your search query' : 'Upload an F1 video to generate your first AI telemetry report.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold uppercase transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Race Video</span>
          </Link>
        </div>
      ) : (
        /* Table of Records */
        <div className="bg-[#121722] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 font-semibold">Video Filename</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Detections</th>
                  <th className="py-3.5 px-4 font-semibold">Flag Events</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 text-xs font-mono">
                {filteredAnalyses.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-800/40 transition group"
                  >
                    {/* Filename */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center space-x-2 group-hover:text-red-400 transition">
                        <span>{item.videoName}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        ID: {item._id} {item.fileSize ? `• ${formatFileSize(item.fileSize)}` : ''}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-300">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-gray-300">
                      <span className="bg-gray-900 px-2 py-1 rounded text-gray-200">
                        {formatDuration(item.duration)}
                      </span>
                    </td>

                    {/* Detections */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-bold">{item.totalDetections || 0}</div>
                      <div className="text-[10px] text-gray-500">{item.totalCars || 0} cars</div>
                    </td>

                    {/* Flag Events */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                        <Flag className="w-3 h-3" />
                        {item.totalEvents || 0}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        {item.status || 'COMPLETED'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/analysis/${item._id}`}
                          className="px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs flex items-center gap-1 transition border border-red-600/40"
                          title="Open Analysis Dashboard"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {deleteConfirmId === item._id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-2 py-1 rounded bg-red-700 text-white text-[11px] font-bold hover:bg-red-800 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-[11px] hover:bg-gray-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
