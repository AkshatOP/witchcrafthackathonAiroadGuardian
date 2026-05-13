import * as potholeService from '../services/potholeService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function reportPothole(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Image file is required', 400);
    }

    const { latitude, longitude } = req.validatedLocation;
    const reportedBy = req.body.reported_by || 'anonymous';

    const pothole = await potholeService.createPotholeReport({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      latitude,
      longitude,
      reportedBy,
    });

    return successResponse(res, pothole, 201);
  } catch (err) {
    next(err);
  }
}

export async function listPotholes(req, res, next) {
  try {
    const { severity, status, limit, offset, min_lat, max_lat, min_lon, max_lon } = req.query;

    const filters = {
      severity,
      status,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    if (min_lat && max_lat && min_lon && max_lon) {
      filters.bbox = {
        minLat: parseFloat(min_lat),
        maxLat: parseFloat(max_lat),
        minLon: parseFloat(min_lon),
        maxLon: parseFloat(max_lon),
      };
    }

    const result = await potholeService.listPotholes(filters);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getPothole(req, res, next) {
  try {
    const pothole = await potholeService.getPotholeById(req.params.id);
    return successResponse(res, pothole);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 'VALIDATION_ERROR', 'status is required', 400);
    }
    const updated = await potholeService.updatePotholeStatus(req.params.id, status);
    return successResponse(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function deletePothole(req, res, next) {
  try {
    await potholeService.deletePotholeById(req.params.id);
    return successResponse(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const stats = await potholeService.getStats();
    return successResponse(res, stats);
  } catch (err) {
    next(err);
  }
}
