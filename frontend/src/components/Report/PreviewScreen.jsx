import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

export default function PreviewScreen() {
  const { capturedImage, setReportFlowStep, closeReportFlow, setAiResult } = useAppStore();
  const [location, setLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setGpsLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleAnalyze = async () => {
    if (!capturedImage || !location) return;
    setAnalyzing(true);
    setReportFlowStep('result');
    // Pass location via store for AIResultScreen to read
    useAppStore.setState({ _pendingLocation: location });
  };

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: '#0a0f1e' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e293b', paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <button
          id="preview-back-btn"
          onClick={() => setReportFlowStep('capture')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-text-muted text-xs">Step 2 of 3</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Image preview */}
        {capturedImage?.preview && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-2xl overflow-hidden"
            style={{ border: '1px solid #1e293b', aspectRatio: '4/3', background: '#0f172a' }}
          >
            <img
              src={capturedImage.preview}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Location section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">📍 Location</span>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: '#0f172a', border: '1px solid #1e293b' }}
          >
            {gpsLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
                <span className="text-text-muted text-sm">📡 Detecting your location...</span>
              </div>
            ) : location ? (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-severity-low flex-shrink-0" />
                <span className="text-text-primary text-sm font-mono">
                  {location.lat.toFixed(6)}° N, {location.lng.toFixed(6)}° E
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-severity-severe flex-shrink-0" />
                <span className="text-severity-severe text-sm">Location unavailable</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex-shrink-0 flex gap-3 px-4 pb-8 pt-4"
        style={{ borderTop: '1px solid #1e293b', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <button
          id="retake-btn"
          onClick={() => setReportFlowStep('capture')}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-text-muted transition-all hover:bg-bg-elevated"
          style={{ border: '1px solid #1e293b' }}
        >
          Retake
        </button>
        <button
          id="analyze-btn"
          onClick={handleAnalyze}
          disabled={!location}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: '#00d4ff',
            color: '#0a0f1e',
            boxShadow: location ? '0 0 16px #00d4ff44' : 'none',
          }}
        >
          Analyze Pothole →
        </button>
      </div>
    </motion.div>
  );
}
