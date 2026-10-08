const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Check if the FastAPI AI service is reachable
 */
async function checkAiHealth() {
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`, { timeout: 3000 });
    return { online: true, data: response.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
}

/**
 * Get AI service configuration
 */
async function getAiConfig() {
  try {
    const response = await axios.get(`${FASTAPI_URL}/config`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    return { mock_mode: true, error: error.message };
  }
}

/**
 * Send video file to FastAPI /analyze endpoint
 * @param {string} filePath - Absolute path to the uploaded video file
 * @param {string} originalFilename - Original uploaded filename
 */
async function analyzeVideo(filePath, originalFilename) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file not found at ${filePath}`);
  }

  const formData = new FormData();
  formData.append('video', fs.createReadStream(filePath), {
    filename: originalFilename || path.basename(filePath)
  });

  try {
    console.log(`[AI Client] Forwarding video to FastAPI at ${FASTAPI_URL}/analyze...`);
    const response = await axios.post(`${FASTAPI_URL}/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 1800000
    });

    console.log(`[AI Client] Analysis response received from FastAPI`);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`AI Service is currently offline (${FASTAPI_URL}). Please ensure FastAPI is running on port 8000.`);
    }
    const message = error.response?.data?.detail || error.message;
    throw new Error(`AI Service analysis failed: ${message}`);
  }
}

module.exports = {
  checkAiHealth,
  getAiConfig,
  analyzeVideo
};
