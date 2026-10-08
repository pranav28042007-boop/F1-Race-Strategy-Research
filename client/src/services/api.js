import axios from 'axios';

// Express API Base URL
// In development, Express runs on port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_STATIC_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1800000, // 3 minutes timeout for video processing
});

/**
 * Fetch system health and connectivity status
 */
export const getHealth = async () => {
  const response = await client.get('/health');
  return response.data;
};

/**
 * Upload video file and start analysis pipeline
 * React -> Express -> FastAPI -> MongoDB -> React
 */
export const uploadAndAnalyze = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await client.post('/analysis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * Fetch all analyses (history)
 */
export const getAllAnalyses = async () => {
  const response = await client.get('/analysis');
  return response.data;
};

/**
 * Fetch single analysis by ID
 */
export const getAnalysisById = async (id) => {
  const response = await client.get(`/analysis/${id}`);
  return response.data;
};

/**
 * Delete analysis by ID
 */
export const deleteAnalysis = async (id) => {
  const response = await client.delete(`/analysis/${id}`);
  return response.data;
};

/**
 * Helper to build full media URL for video / heatmap
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${SERVER_STATIC_URL}${path}`;
};

/**
 * Format seconds into mm:ss
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format bytes to readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
