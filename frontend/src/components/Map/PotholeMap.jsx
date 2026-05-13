import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../store/appStore';
import PotholeMarker from './PotholeMarker';
import SeverityLegend from './SeverityLegend';
import 'leaflet/dist/leaflet.css';

function pinIcon(label, bg, textColor = '#fff') {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${bg};
          border:3px solid #0a0f1e;
          box-shadow:0 0 20px ${bg}99, 0 4px 12px rgba(0,0,0,0.6);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:13px;font-weight:900;color:${textColor};font-family:Inter,sans-serif;">${label}</span>
        </div>
      </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

const ICON_A = pinIcon('A', '#00d4ff', '#0a0f1e');
const ICON_B = pinIcon('B', '#ef4444', '#fff');

function MapController() {
  const map = useMap();
  const { setMapRef, setMapCenter, setMapZoom } = useAppStore();
  useEffect(() => { setMapRef(map); }, [map, setMapRef]);
  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      setMapCenter([c.lat, c.lng]);
      setMapZoom(map.getZoom());
    },
  });
  return null;
}

function LongPressHandler() {
  const { openReportFlow } = useAppStore();
  const pressTimer = useRef(null);
  useMapEvents({
    mousedown:  () => { pressTimer.current = setTimeout(() => openReportFlow(), 800); },
    mouseup:    () => clearTimeout(pressTimer.current),
    mousemove:  () => clearTimeout(pressTimer.current),
    touchstart: () => { pressTimer.current = setTimeout(() => openReportFlow(), 800); },
    touchend:   () => clearTimeout(pressTimer.current),
    touchmove:  () => clearTimeout(pressTimer.current),
  });
  return null;
}

export default function PotholeMap() {
  const { filteredPotholes, userLocation, locationA, locationB, routeActive, routeData, activeRoute } = useAppStore();
  const toLL = c => c.map(([lng, lat]) => [lat, lng]);
  const activeCoords = routeData
    ? (activeRoute === 'shortest' ? routeData.shortest : routeData.smoothest)?.coords
    : null;
  const inactiveCoords = routeData && activeRoute === 'smoothest' &&
    routeData.shortest?.coords?.length !== routeData.smoothest?.coords?.length
    ? routeData.shortest.coords : null;
  const displayPotholes = filteredPotholes();

  const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
  const initialZoom   = userLocation ? 14 : 5;

  return (
    <div className="absolute inset-0" style={{ zIndex: 0, isolation: 'isolate' }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <MapController />
        <LongPressHandler />

        {displayPotholes.map((p, i) => (
          <PotholeMarker key={p.id || i} pothole={p} index={i} />
        ))}

        {userLocation && (
          <PotholeMarker
            pothole={{ id: '__user', latitude: userLocation.lat, longitude: userLocation.lng, severity: '__user' }}
            isUser
          />
        )}

        {/* Route polylines — drawn inline so Zustand re-renders hit JSX directly */}
        {routeActive && inactiveCoords && (
          <Polyline positions={toLL(inactiveCoords)}
            pathOptions={{ color: '#475569', weight: 3, opacity: 0.45, dashArray: '8 6' }} />
        )}
        {routeActive && activeCoords && (
          <Polyline positions={toLL(activeCoords)}
            pathOptions={{ color: '#00d4ff', weight: 14, opacity: 0.18, lineCap: 'round', lineJoin: 'round' }} />
        )}
        {routeActive && activeCoords && (
          <Polyline positions={toLL(activeCoords)}
            pathOptions={{ color: '#00d4ff', weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
        )}

        {/* A / B destination pins */}
        {locationA && <Marker position={[locationA.lat, locationA.lng]} icon={ICON_A} />}
        {locationB && <Marker position={[locationB.lat, locationB.lng]} icon={ICON_B} />}

        <SeverityLegend />
      </MapContainer>
    </div>
  );
}
