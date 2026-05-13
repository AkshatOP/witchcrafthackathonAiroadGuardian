import { errorResponse } from '../utils/response.js';

export const validatePotholeReport = (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return errorResponse(res, 'VALIDATION_ERROR', 'latitude and longitude are required', 400);
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return errorResponse(res, 'VALIDATION_ERROR', 'latitude must be a number between -90 and 90', 400);
  }

  if (isNaN(lon) || lon < -180 || lon > 180) {
    return errorResponse(res, 'VALIDATION_ERROR', 'longitude must be a number between -180 and 180', 400);
  }

  req.validatedLocation = { latitude: lat, longitude: lon };
  next();
};
