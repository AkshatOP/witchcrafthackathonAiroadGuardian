import * as potholeRepo from '../repositories/potholeRepository.js';
import { uploadImage } from './storageService.js';
import { detectPotholes } from './aiService.js';
import { getDigipin } from './digipinService.js';
import { logger } from '../utils/logger.js';

/**
 * Full pipeline: image → AI detection → storage upload → DB insert
 */
export async function createPotholeReport({ imageBuffer, mimeType, latitude, longitude, reportedBy }) {
  logger.info('Creating pothole report', { latitude, longitude });

  // Run image upload and AI detection in parallel
  const [imageUrl, aiResult] = await Promise.all([
    uploadImage(imageBuffer, mimeType),
    detectPotholes(imageBuffer, mimeType),
  ]);

  const digipin = await getDigipin(latitude, longitude);

  logger.info('AI result received', { detected: aiResult.detected, severity: aiResult.severity, confidence: aiResult.confidence });

  const record = {
    latitude,
    longitude,
    digipin,
    severity: aiResult.severity || 'low',
    confidence: aiResult.confidence || 0,
    image_url: imageUrl,
    status: 'pending',
    reported_by: reportedBy || 'anonymous',
    ai_metadata: {
      detected: aiResult.detected,
      detection_count: aiResult.detection_count,
      bounding_boxes: aiResult.bounding_boxes,
      fallback: aiResult.fallback || false,
    },
  };

  const saved = await potholeRepo.insertPothole(record);
  return saved;
}

export async function listPotholes(filters) {
  return potholeRepo.findAll(filters);
}

export async function getPotholeById(id) {
  const pothole = await potholeRepo.findById(id);
  if (!pothole) {
    const err = new Error('Pothole not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return pothole;
}

export async function updatePotholeStatus(id, status) {
  const valid = ['pending', 'verified', 'resolved'];
  if (!valid.includes(status)) {
    const err = new Error(`status must be one of: ${valid.join(', ')}`);
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  return potholeRepo.updateStatus(id, status);
}

export async function deletePotholeById(id) {
  // deleteById throws NOT_FOUND if no row matched
  await potholeRepo.deleteById(id);
}

export async function getStats() {
  return potholeRepo.getStats();
}
