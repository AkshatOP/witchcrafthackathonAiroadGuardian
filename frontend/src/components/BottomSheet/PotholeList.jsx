import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

const SEVERITY_COLORS = { severe: '#ef4444', medium: '#eab308', low: '#22c55e' };
const SEVERITY_LABELS = { severe: 'Severe', medium: 'Medium', low: 'Low' };
const SEVERITY_GLOW = { severe: '#ef444444', medium: '#eab30844', low: '#22c55e44' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PotholeRow({ pothole, index }) {
  const { mapRef } = useAppStore();
  const color = SEVERITY_COLORS[pothole.severity] || '#94a3b8';

  const flyTo = () => {
    if (mapRef && pothole.latitude && pothole.longitude) {
      mapRef.flyTo([pothole.latitude, pothole.longitude], 17, { animate: true, duration: 0.8 });
    }
  };

  // Generate a pseudo-address from digipin or coords
  const label = pothole.digipin
    ? `DIGIPIN: ${pothole.digipin}`
    : pothole.latitude
    ? `${pothole.latitude.toFixed(4)}°N, ${pothole.longitude.toFixed(4)}°E`
    : 'Unknown location';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={flyTo}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-bg-elevated"
      style={{ borderBottom: '1px solid #1e293b10' }}
    >
      {/* Severity dot */}
      <div
        className="flex-shrink-0 w-3 h-3 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${SEVERITY_GLOW[pothole.severity]}` }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{label}</p>
        <p className="text-text-muted text-xs mt-0.5">
          {SEVERITY_LABELS[pothole.severity] || pothole.severity} ·{' '}
          {Math.round((pothole.confidence || 0) * 100)}% ·{' '}
          {timeAgo(pothole.created_at)}
        </p>
      </div>

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </motion.button>
  );
}

export default function PotholeList({ potholes }) {
  if (!potholes || potholes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: '#22c55e1a', border: '1px solid #22c55e44' }}
        >
          <span className="text-xl">🟢</span>
        </div>
        <p className="text-text-primary text-sm font-medium">Clean Roads Detected</p>
        <p className="text-text-muted text-xs text-center px-6">No potholes reported nearby.</p>
      </div>
    );
  }

  return (
    <div>
      {potholes.map((p, i) => (
        <PotholeRow key={p.id || i} pothole={p} index={i} />
      ))}
    </div>
  );
}
