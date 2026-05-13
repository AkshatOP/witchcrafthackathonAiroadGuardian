import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Send image buffer to AI microservice for pothole detection.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @returns {Promise<AIResult>}
 */
export async function detectPotholes(imageBuffer, mimeType = 'image/jpeg') {
  const form = new FormData();
  const ext = mimeType.split('/')[1] || 'jpg';
  form.append('file', imageBuffer, { filename: `image.${ext}`, contentType: mimeType });

  try {
    const response = await axios.post(
      `${env.aiServiceUrl}/detect`,
      form,
      { headers: form.getHeaders(), timeout: 30000 }
    );
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      logger.warn('AI service unavailable, returning fallback result');
      return fallbackResult();
    }
    throw Object.assign(new Error('AI service error: ' + err.message), { code: 'AI_SERVICE_ERROR' });
  }
}

function fallbackResult() {
  return {
    detected: false,
    confidence: 0,
    severity: 'low',
    bounding_boxes: [],
    detection_count: 0,
    fallback: true,
  };
}
