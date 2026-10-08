const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createAnalysis,
  getAllAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getHealth
} = require('../controllers/analysisController');

// System health
router.get('/health', getHealth);

// Analysis CRUD
router.post('/analysis', upload.single('video'), createAnalysis);
router.get('/analysis', getAllAnalyses);
router.get('/analysis/:id', getAnalysisById);
router.delete('/analysis/:id', deleteAnalysis);

module.exports = router;
