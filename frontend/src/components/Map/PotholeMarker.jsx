import { useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { motion } from 'framer-motion';
import MarkerPopup from './MarkerPopup';

const SEVERITY_CONFIG = {
  severe: {
    color: '#ef4444',
    ringSize: 32,
    dotSize: 12,
    glow: '0 0 12px #ef4444',
    ringClass: 'marker-severe-ring',
    ringBg: 'rgba(239,68,68,0.2)',
  },
  medium: {
    color: '#eab308',
    ringSize: 28,
    dotSize: 10,
    glow: '0 0 10px #eab308',
    ringClass: 'marker-medium-ring',
    ringBg: 'rgba(234,179,8,0.2)',
  },
  low: {
    color: '#22c55e',
    ringSize: 24,
    dotSize: 8,
    glow: '0 0 8px #22c55e',
    ringClass: 'marker-low-ring',
    ringBg: 'rgba(34,197,94,0.2)',
  },
  __user: {
    color: '#00d4ff',
    ringSize: 28,
    dotSize: 10,
    glow: '0 0 12px #00d4ff',
    ringClass: 'marker-medium-ring',
    ringBg: 'rgba(0,212,255,0.2)',
  },
};

function createMarkerIcon(severity) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  const html = `
    <div style="position:relative;width:${cfg.ringSize}px;height:${cfg.ringSize}px;display:flex;align-items:center;justify-content:center;">
      <div class="${cfg.ringClass}" style="
        position:absolute;
        inset:0;
        border-radius:50%;
        background:${cfg.ringBg};
        border:2px solid ${cfg.color};
      "></div>
      <div style="
        width:${cfg.dotSize}px;
        height:${cfg.dotSize}px;
        border-radius:50%;
        background:${cfg.color};
        box-shadow:${cfg.glow};
        position:relative;
        z-index:2;
      "></div>
    </div>
  `;
  return L.divIcon({
    className: '',
    html,
    iconSize: [cfg.ringSize, cfg.ringSize],
    iconAnchor: [cfg.ringSize / 2, cfg.ringSize / 2],
    popupAnchor: [0, -(cfg.ringSize / 2 + 4)],
  });
}

export default function PotholeMarker({ pothole, isUser, index = 0 }) {
  const map = useMap();
  const markerRef = useRef(null);

  if (!pothole.latitude || !pothole.longitude) return null;

  const icon = createMarkerIcon(pothole.severity);

  const handleClick = () => {
    map.flyTo([pothole.latitude, pothole.longitude], Math.max(map.getZoom(), 16), {
      animate: true,
      duration: 0.8,
    });
  };

  if (isUser) {
    return (
      <Marker
        position={[pothole.latitude, pothole.longitude]}
        icon={icon}
      />
    );
  }

  return (
    <Marker
      ref={markerRef}
      position={[pothole.latitude, pothole.longitude]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup minWidth={280} maxWidth={320} autoPan={true}>
        <MarkerPopup pothole={pothole} />
      </Popup>
    </Marker>
  );
}
