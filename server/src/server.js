require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads/videos'),
  path.join(__dirname, '../uploads/heatmaps'),
  path.join(__dirname, '../uploads/analyzed')
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors({
  origin: '*', // Allow React client
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', analysisRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'F1 Visual Race Intelligence API is online',
    docs: {
      health: '/api/health',
      analysis: '/api/analysis'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Video file size exceeds maximum limit of 500MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload Error: ${err.message}`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  🏎️  F1 Visual Race Intelligence Backend`);
    console.log(`  🚀  Server running on http://localhost:${PORT}`);
    console.log(`  📡  FastAPI AI Service target: ${process.env.FASTAPI_URL || 'http://localhost:8000'}`);
    console.log(`===============================================`);
  });
};

startServer();
