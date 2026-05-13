import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { deletePotholeById } from '../../lib/api';

const SEVERITY_COLORS = {
  severe: '#ef4444',
  medium: '#eab308',
  low: '#22c55e',
};

const SEVERITY_LABELS = {
  severe: 'SEVERE',
  medium: 'MEDIUM',
  low: 'LOW',
};

const TOTAL_FALLBACK_IMGS = 15;

/**
 * Returns pothole.image_url if present, otherwise deterministically picks
 * one of the 15 seeded images based on the pothole's id so every marker
 * has a photo in the popup.
 */
function resolveImage(pothole) {
  if (pothole.image_url) return pothole.image_url;
  const hash = pothole.id
    ? parseInt(pothole.id.replace(/-/g, '').slice(-6), 16)
    : 0;
  const n = (hash % TOTAL_FALLBACK_IMGS) + 1;
  return `/pothole-images/pothole${String(n).padStart(2, '0')}.jpg`;
}

function ConfidenceBar({ value, severity }) {
  const color = SEVERITY_COLORS[severity] || '#94a3b8';
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color, minWidth: '36px' }}>
        {pct}%
      </span>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`;
}

export default function MarkerPopup({ pothole }) {
  const { setLocationB, setSearchExpanded, removePothole } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const imageUrl = resolveImage(pothole);
  const severityColor = SEVERITY_COLORS[pothole.severity] || '#94a3b8';
  const severityLabel = SEVERITY_LABELS[pothole.severity] || pothole.severity?.toUpperCase();

  const copyDigipin = () => {
    if (pothole.digipin) {
      navigator.clipboard.writeText(pothole.digipin).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const getRoute = () => {
    setLocationB({
      label: `${pothole.digipin || 'Pothole'} (${pothole.latitude?.toFixed(4)}, ${pothole.longitude?.toFixed(4)})`,
      lat: pothole.latitude,
      lng: pothole.longitude,
    });
    setSearchExpanded(true);
  };

  const handleDelete = async () => {
    if (!pothole.id || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await deletePotholeById(pothole.id);
      if (res.success) {
        removePothole(pothole.id);
        // Marker is gone — nothing more to do here
      } else {
        throw new Error(res.error?.message || 'Delete returned non-success');
      }
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.message || 'Delete failed';
      setDeleteError(msg);
      setDeleting(false);
    }
  };

  return (
    <>
      <div style={{ minWidth: '260px', maxWidth: '300px', fontFamily: "'Inter', sans-serif" }}>

        {/* ── Inline photo ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden cursor-pointer"
          style={{ height: '150px', borderBottom: '1px solid #1e293b', borderRadius: '8px 8px 0 0' }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={imageUrl}
            alt="Pothole"
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Severity badge */}
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold"
            style={{ background: `${severityColor}cc`, color: '#fff', letterSpacing: '0.06em' }}
          >
            {severityLabel}
          </div>
          {/* Expand hint */}
          <div
            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8' }}
          >
            ↗ view full
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-8"
            style={{ background: 'linear-gradient(transparent, rgba(10,15,30,0.6))' }}
          />
        </div>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: severityColor, boxShadow: `0 0 6px ${severityColor}` }}
            />
            <span className="text-xs font-bold tracking-widest" style={{ color: severityColor }}>
              {severityLabel} POTHOLE
            </span>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="px-4 py-3 space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-text-muted text-xs">Confidence</span>
            </div>
            <ConfidenceBar value={pothole.confidence} severity={pothole.severity} />
          </div>

          {pothole.digipin && (
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs">DIGIPIN</span>
              <button
                onClick={copyDigipin}
                className="font-mono text-xs px-2 py-1 rounded transition-all hover:bg-bg-elevated"
                style={{
                  color: copied ? '#22c55e' : '#00d4ff',
                  border: '1px solid',
                  borderColor: copied ? '#22c55e44' : '#00d4ff33',
                  letterSpacing: '0.05em',
                }}
                title="Tap to copy"
              >
                {copied ? '✓ Copied!' : pothole.digipin}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs">Status</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: pothole.status === 'resolved' ? '#22c55e' : '#eab308' }}
              />
              <span className="text-text-primary text-xs capitalize">
                {pothole.status || 'pending'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs">Reported</span>
            <span className="text-text-primary text-xs">{timeAgo(pothole.created_at)}</span>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
          <button
            onClick={getRoute}
            className="w-full py-2 rounded-lg text-xs font-bold transition-all"
            style={{ background: '#00d4ff', color: '#0a0f1e' }}
          >
            Get Route
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ border: '1px solid #ef444440', color: '#ef4444', background: '#ef444410' }}
          >
            {deleting ? 'Deleting…' : '🗑 Delete (test)'}
          </button>

          {deleteError && (
            <p className="text-xs text-center" style={{ color: '#ef4444' }}>
              ✗ {deleteError}
            </p>
          )}
        </div>
      </div>

      {/* ── Fullscreen lightbox ───────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={imageUrl}
            alt="Pothole full"
            className="max-w-full max-h-full rounded-xl"
            style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: severityColor, color: '#fff' }}
          >
            {severityLabel} POTHOLE
          </div>
        </div>
      )}
    </>
  );
}
