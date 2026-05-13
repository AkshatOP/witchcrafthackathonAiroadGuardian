import { supabaseAdmin } from '../config/supabase.js';

const BUFFER_DEG = 0.00045; // ~50m at Bengaluru's latitude

/** Haversine distance between two points in metres */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Minimum distance from point (pLat, pLng) to any segment of the route.
 * Route coords are GeoJSON [[lng,lat], ...] order.
 */
function minDistToRoute(pLat, pLng, coords) {
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    // Sample 5 points along the segment (cheap approximation)
    for (let t = 0; t <= 1; t += 0.2) {
      const sLat = lat1 + t * (lat2 - lat1);
      const sLng = lng1 + t * (lng2 - lng1);
      const d = haversine(pLat, pLng, sLat, sLng);
      if (d < minDist) minDist = d;
    }
  }
  return minDist;
}

/**
 * Fetch potholes in the bounding box of the route, then filter precisely.
 * Returns { total, severe, medium, low }
 */
export async function countPotholesAlongRoute(coords) {
  // Build bounding box (GeoJSON [lng,lat] order)
  const lats = coords.map(([, lat]) => lat);
  const lngs = coords.map(([lng]) => lng);
  const minLat = Math.min(...lats) - BUFFER_DEG * 2;
  const maxLat = Math.max(...lats) + BUFFER_DEG * 2;
  const minLng = Math.min(...lngs) - BUFFER_DEG * 2;
  const maxLng = Math.max(...lngs) + BUFFER_DEG * 2;

  const { data, error } = await supabaseAdmin
    .from('potholes')
    .select('id, severity, latitude, longitude')
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng);

  if (error) throw new Error(`Pothole query failed: ${error.message}`);

  // Precise 50m filter
  const nearby = (data || []).filter(
    p => minDistToRoute(p.latitude, p.longitude, coords) <= 50
  );

  return {
    total:  nearby.length,
    severe: nearby.filter(p => p.severity === 'severe').length,
    medium: nearby.filter(p => p.severity === 'medium').length,
    low:    nearby.filter(p => p.severity === 'low').length,
  };
}
