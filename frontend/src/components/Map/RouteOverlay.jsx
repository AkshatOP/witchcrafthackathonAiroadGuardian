import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function RouteOverlay({ from, to }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!from || !to) return;

    const pointA = [from.lat, from.lng];
    const pointB = [to.lat, to.lng];

    // Glow layer (wide, semi-transparent)
    const glowLine = L.polyline([pointA, pointB], {
      color: '#00d4ff44',
      weight: 14,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(map);

    // Main animated line
    const mainLine = L.polyline([pointA, pointB], {
      color: '#00d4ff',
      weight: 5,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(map);

    // Animate via SVG stroke-dashoffset
    const path = mainLine.getElement();
    if (path) {
      const len = path.getTotalLength?.() ?? 1000;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
      requestAnimationFrame(() => {
        path.style.strokeDashoffset = '0';
      });
    }

    // Endpoint markers
    const makeEndpoint = (latlng, color, letter) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};color:#0a0f1e;
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:12px;font-family:'Inter',sans-serif;
          box-shadow:0 0 12px ${color};
          border:2px solid rgba(255,255,255,0.3);
        ">${letter}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      return L.marker(latlng, { icon, interactive: false }).addTo(map);
    };

    const markerA = makeEndpoint(pointA, '#00d4ff', 'A');
    const markerB = makeEndpoint(pointB, '#ef4444', 'B');

    layersRef.current = [glowLine, mainLine, markerA, markerB];

    // Fit bounds
    map.fitBounds([pointA, pointB], { padding: [60, 60], animate: true });

    return () => {
      layersRef.current.forEach((l) => {
        try { map.removeLayer(l); } catch (_) {}
      });
      layersRef.current = [];
    };
  }, [map, from, to]);

  return null;
}
