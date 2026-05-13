import { getRoutes } from '../services/routeService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export async function fetchRoutes(req, res, next) {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return errorResponse(res, 'MISSING_PARAMS', 'fromLat, fromLng, toLat, toLng are required');
    }

    const fLat = parseFloat(fromLat);
    const fLng = parseFloat(fromLng);
    const tLat = parseFloat(toLat);
    const tLng = parseFloat(toLng);

    if ([fLat, fLng, tLat, tLng].some(isNaN)) {
      return errorResponse(res, 'INVALID_COORDS', 'All coordinates must be valid numbers');
    }

    const result = await getRoutes(fLat, fLng, tLat, tLng);
    return successResponse(res, result);
  } catch (err) {
    logger.error('Route fetch failed', { error: err.message });
    next(err);
  }
}
