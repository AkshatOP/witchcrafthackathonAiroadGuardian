import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { reportPothole } from '../../lib/api';

const SEVERITY_COLORS = { severe: '#ef4444', medium: '#eab308', low: '#22c55e' };
const SEVERITY_LABELS = { severe: 'SEVERE', medium: 'MEDIUM', low: 'LOW' };

function BboxCanvas({ imageUrl, bbox }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !bbox || !canvasRef.current) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // bbox coords are normalized 0-1 — convert to pixel coords
      const px1 = bbox.x1 * img.naturalWidth;
      const py1 = bbox.y1 * img.naturalHeight;
      const px2 = bbox.x2 * img.naturalWidth;
      const py2 = bbox.y2 * img.naturalHeight;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.max(2, img.naturalWidth * 0.004);
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.strokeRect(px1, py1, px2 - px1, py2 - py1);

      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${Math.max(14, img.naturalWidth * 0.025)}px Inter`;
      ctx.fillText('Pothole', px1 + 4, py1 > 20 ? py1 - 6 : py1 + 20);
    };
  }, [imageUrl, bbox]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover rounded-xl"
      style={{ display: 'block' }}
    />
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {/* Shimmer image */}
      <div
        className="w-full rounded-2xl skeleton"
        style={{ aspectRatio: '4/3' }}
      />
      <div className="space-y-3 px-1">
        <div className="skeleton h-6 rounded-lg" style={{ width: '60%' }} />
        <div className="skeleton h-4 rounded-lg" style={{ width: '80%' }} />
        <div className="skeleton h-4 rounded-lg" style={{ width: '70%' }} />
        <div className="skeleton h-4 rounded-lg" style={{ width: '50%' }} />
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
          <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          Analyzing with YOLOv8 AI...
        </div>
      </div>
    </div>
  );
}

export default function AIResultScreen() {
  const { capturedImage, aiResult, setAiResult, setReportFlowStep, closeReportFlow, mapRef, addPothole } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const location = useAppStore.getState()._pendingLocation;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!capturedImage?.file || !location) {
        setLoading(false);
        setError('Missing image or location');
        return;
      }
      try {
        const res = await reportPothole(
          capturedImage.file,
          location.lat,
          location.lng
        );
        if (cancelled) return;
        if (res.success && res.data) {
          // Immediately push marker to the map — don't wait for realtime
          addPothole(res.data);

          setAiResult({
            detected: res.data.ai_metadata?.detected ?? true,
            severity: res.data.severity,
            confidence: res.data.confidence,
            digipin: res.data.digipin,
            bbox: res.data.ai_metadata?.bounding_boxes?.[0]?.bbox ?? null,
            id: res.data.id,
            latitude: res.data.latitude,
            longitude: res.data.longitude,
            image_url: res.data.image_url,
          });
        } else {
          setError(res.error?.message || 'Analysis failed');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = () => {
    if (aiResult?.latitude && mapRef) {
      mapRef.flyTo([aiResult.latitude, aiResult.longitude], 17);
    }
    setReportFlowStep('success');
  };

  const severityColor = SEVERITY_COLORS[aiResult?.severity] || '#94a3b8';

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
          id="result-back-btn"
          onClick={() => setReportFlowStep('preview')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-text-muted text-xs">Step 3 of 3</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 space-y-3"
          >
            <div className="text-4xl">❌</div>
            <p className="text-severity-severe font-semibold">Analysis Failed</p>
            <p className="text-text-muted text-sm">{error}</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Image with bbox */}
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: '4/3', background: '#0f172a', border: '1px solid #1e293b' }}
              >
                {aiResult?.bbox && capturedImage?.preview ? (
                  <BboxCanvas imageUrl={capturedImage.preview} bbox={aiResult.bbox} />
                ) : (
                  <img src={capturedImage?.preview} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Detection badge */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{aiResult?.detected ? '✅' : '❌'}</span>
                <div>
                  <p className="text-text-primary font-bold text-base">
                    {aiResult?.detected ? 'POTHOLE DETECTED' : 'No Pothole Found'}
                  </p>
                  {!aiResult?.detected && (
                    <p className="text-text-muted text-sm">The AI did not detect a pothole in this image.</p>
                  )}
                </div>
              </div>

              {aiResult?.detected && (
                <div className="rounded-2xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
                  {/* Severity */}
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e293b' }}>
                    <span className="text-text-muted text-sm">Severity</span>
                    <span
                      className="text-sm font-bold px-3 py-1 rounded-full"
                      style={{
                        color: severityColor,
                        background: `${severityColor}20`,
                        border: `1px solid ${severityColor}60`,
                      }}
                    >
                      {SEVERITY_LABELS[aiResult?.severity] || aiResult?.severity?.toUpperCase()}
                    </span>
                  </div>

                  {/* Confidence */}
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e293b' }}>
                    <div className="flex justify-between mb-2">
                      <span className="text-text-muted text-sm">Confidence</span>
                      <span className="text-sm font-mono" style={{ color: severityColor }}>
                        {Math.round((aiResult?.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((aiResult?.confidence || 0) * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: severityColor, boxShadow: `0 0 8px ${severityColor}` }}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e293b' }}>
                    <span className="text-text-muted text-sm">Location</span>
                    <span className="text-text-primary text-xs font-mono">
                      {location?.lat?.toFixed(4)}° N, {location?.lng?.toFixed(4)}° E
                    </span>
                  </div>

                  {/* DIGIPIN */}
                  {aiResult?.digipin && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-text-muted text-sm">DIGIPIN</span>
                      <span className="text-accent-cyan text-sm font-mono">{aiResult.digipin}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Actions */}
      {!loading && (
        <div
          className="flex-shrink-0 flex gap-3 px-4 pt-4 pb-8"
          style={{ borderTop: '1px solid #1e293b', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
        >
          <button
            id="discard-btn"
            onClick={closeReportFlow}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-text-muted transition-all hover:bg-bg-elevated"
            style={{ border: '1px solid #1e293b' }}
          >
            Discard
          </button>
          {!error && aiResult?.detected && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              id="submit-report-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: '#00d4ff', color: '#0a0f1e', boxShadow: '0 0 16px #00d4ff44' }}
            >
              {submitting ? 'Submitting...' : 'Submit Report ✓'}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
