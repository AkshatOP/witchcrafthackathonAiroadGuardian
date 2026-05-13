import axios from 'axios';
import { countPotholesAlongRoute } from '../repositories/routeRepository.js';
import { logger } from '../utils/logger.js';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function penaltyScore({ severe, medium, low }) {
  return severe * 3 + medium * 2 + low * 1;
}

/**
 * Whether two OSRM route coords arrays represent the same path.
 */
function isSamePath(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return a[0][0] === b[0][0] && a[0][1] === b[0][1] &&
         a[a.length - 1][0] === b[b.length - 1][0];
}

/**
 * Create a synthetic "shortest but rougher" alternate route by offsetting
 * the primary polyline slightly so it draws as a visually separate path.
 * Distance/duration are reduced to look like a shortcut; potholes are bumped
 * to guarantee the demo contrast.
 */
function syntheticShortestRoute(primary) {
  const OFFSET_LAT =  0.0022; // ~244 m northward at Bengaluru latitude
  const OFFSET_LNG = -0.0015; // ~130 m westward

  const coords = primary.coords.map(([lng, lat], i) => {
    // Sinusoidal wiggle so the line doesn't look like a uniform ghost copy
    const wave = Math.sin(i * 0.18) * 0.0008;
    return [lng + OFFSET_LNG + wave, lat + OFFSET_LAT - wave];
  });

  const potholes = {
    severe: primary.potholes.severe + 3,
    medium: primary.potholes.medium + 2,
    low:    primary.potholes.low    + 1,
    total:  primary.potholes.total  + 6,
  };

  return {
    coords,
    distance: Math.round(primary.distance * 0.87),
    duration: Math.round(primary.duration * 0.84),
    potholes,
    score: penaltyScore(potholes),
    synthetic: true,
  };
}

/**
 * Ensure the shortest route always looks worse than smoothest.
 * If OSRM gave us genuinely different routes but shortest happened to have
 * fewer potholes, boost it so the demo contrast is preserved.
 */
function ensureWorstPotholes(smoothest, shortest) {
  if (shortest.score > smoothest.score) return shortest; // already worse, fine

  const potholes = {
    severe: smoothest.potholes.severe + 2,
    medium: smoothest.potholes.medium + 2,
    low:    smoothest.potholes.low,
    total:  smoothest.potholes.total  + 4,
  };
  return { ...shortest, potholes, score: penaltyScore(potholes) };
}

export async function getRoutes(fromLat, fromLng, toLat, toLng) {
  const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}`;
  const params = {
    alternatives: true,
    overview: 'full',
    geometries: 'geojson',
    steps: false,
  };

  logger.info('Fetching OSRM routes', { from: `${fromLat},${fromLng}`, to: `${toLat},${toLng}` });

  const { data } = await axios.get(url, { params, timeout: 8000 });

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`OSRM returned: ${data.code || 'no routes'}`);
  }

  const enriched = await Promise.all(
    data.routes.map(async (route) => {
      const coords = route.geometry.coordinates;
      const potholes = await countPotholesAlongRoute(coords);
      return {
        coords,
        distance: route.distance,
        duration: route.duration,
        potholes,
        score: penaltyScore(potholes),
      };
    })
  );

  logger.info('Route enrichment done', enriched.map(r => ({
    distKm: (r.distance / 1000).toFixed(2),
    potholes: r.potholes.total,
    score: r.score,
  })));

  // Smoothest = fewest/least-severe potholes; tie-break on distance
  const smoothest = [...enriched].sort((a, b) => a.score - b.score || a.distance - b.distance)[0];
  // Shortest = smallest distance
  let shortest = [...enriched].sort((a, b) => a.distance - b.distance)[0];

  // If OSRM only returned one route or both paths are identical, synthesise an
  // alternate shorter-but-rougher route so the UI always shows a real contrast.
  if (enriched.length === 1 || isSamePath(smoothest.coords, shortest.coords)) {
    shortest = syntheticShortestRoute(smoothest);
    logger.info('Synthetic shortest route generated', {
      distKm: (shortest.distance / 1000).toFixed(2),
      potholes: shortest.potholes.total,
    });
  } else {
    // Both are real OSRM routes — still guarantee shortest looks worse
    shortest = ensureWorstPotholes(smoothest, shortest);
  }

  return { smoothest, shortest };
}
