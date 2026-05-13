/**
 * Draws glowing OSRM route polylines on the Leaflet map.
 * Uses raw L.polyline via useMap() — same pattern as Resonet/AnimatedRoute.
 * Route data is passed as a prop (not read from Zustand) to guarantee re-renders.
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GLOW  = { weight: 14, opacity: 0.18, lineCap: 'round', lineJoin: 'round' };
const CORE  = { weight: 4,  opacity: 0.95, lineCap: 'round', lineJoin: 'round' };
const DIM   = { weight: 3,  opacity: 0.40, lineCap: 'round', lineJoin: 'round', dashArray: '8 6' };

/** GeoJSON [lng,lat] → Leaflet [lat,lng] */
const toLL = coords => coords.map(([lng, lat]) => [lat, lng]);

function endpointIcon(label, bg) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};border:3px solid #0a0f1e;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:${label==='A'?'#0a0f1e':'#fff'};box-shadow:0 0 16px ${bg}99;">${label}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

export default function RouteOverlay({ routeData, activeRoute }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !routeData) return;

    const group = L.layerGroup().addTo(map);
    const { smoothest, shortest } = routeData;
    const isSmooth = activeRoute !== 'shortest';

    const activeLine  = isSmooth ? smoothest : shortest;
    const inactiveLine = isSmooth ? shortest  : smoothest;

    const sameRoute = smoothest?.coords?.length === shortest?.coords?.length &&
      smoothest?.coords?.[0]?.[0] === shortest?.coords?.[0]?.[0];

    // Inactive (dim dashed), only if genuinely different
    if (!sameRoute && inactiveLine?.coords?.length) {
      const inactiveColor = isSmooth ? '#a78bfa' : '#00d4ff';
      L.polyline(toLL(inactiveLine.coords), { color: inactiveColor, ...DIM }).addTo(group);
    }

    // Active route: glow + core
    const activeColor = isSmooth ? '#00d4ff' : '#a78bfa';
    if (activeLine?.coords?.length) {
      L.polyline(toLL(activeLine.coords), { color: activeColor, ...GLOW }).addTo(group);
      L.polyline(toLL(activeLine.coords), { color: activeColor, ...CORE }).addTo(group);

      // Endpoint markers
      const [sLng, sLat] = activeLine.coords[0];
      const [eLng, eLat] = activeLine.coords[activeLine.coords.length - 1];
      L.marker([sLat, sLng], { icon: endpointIcon('A', activeColor) }).addTo(group);
      L.marker([eLat, eLng], { icon: endpointIcon('B', '#ef4444') }).addTo(group);
    }

    return () => { group.removeFrom(map); };
  }, [map, routeData, activeRoute]);

  return null;
}
