import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

export default function CaptureScreen() {
  const { setReportFlowStep, setCapturedImage, closeReportFlow } = useAppStore();
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [camError, setCamError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCapturedImage({ file, preview });
    setReportFlowStep('preview');
  };

  // Explicitly ask for camera permission before triggering the file input
  const handleCameraClick = async () => {
    setCamError(null);
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Permission granted — stop the preview stream and open native camera picker
        stream.getTracks().forEach((t) => t.stop());
        cameraRef.current?.click();
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setCamError('Camera permission denied. Please allow camera access and try again.');
        } else {
          // Permission API not available or already granted — just open picker
          cameraRef.current?.click();
        }
      }
    } else {
      // Fallback for browsers without getUserMedia
      cameraRef.current?.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: '#0a0f1e' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e293b', paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button
          id="capture-cancel-btn"
          onClick={closeReportFlow}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Cancel
        </button>
        <span className="text-text-muted text-xs">Step 1 of 3</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-center"
        >
          <h2 className="text-text-primary text-xl font-bold mb-1">Report a Pothole</h2>
          <p className="text-text-muted text-sm">Take a photo or choose from your gallery</p>
        </motion.div>

        {/* Camera frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden relative"
          style={{ aspectRatio: '4/3', background: '#0f172a', border: '2px dashed #1e293b' }}
        >
          {/* Corner accents */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-8 h-8`}
              style={{
                borderColor: '#00d4ff',
                borderStyle: 'solid',
                borderWidth: i === 0 ? '2px 0 0 2px' : i === 1 ? '2px 2px 0 0' : i === 2 ? '0 0 2px 2px' : '0 2px 2px 0',
              }}
            />
          ))}

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#1e293b' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p className="text-text-muted text-sm text-center px-4">
              Tap the shutter button below<br />
              <span className="text-xs" style={{ color: '#00d4ff88' }}>Camera permission will be requested</span>
            </p>
          </div>
        </motion.div>

        {/* Camera error */}
        {camError && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-center px-4"
            style={{ color: '#ef4444' }}
          >
            {camError}
          </motion.p>
        )}

        {/* Gallery button */}
        <button
          id="gallery-btn"
          onClick={() => galleryRef.current?.click()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-primary transition-all hover:bg-bg-elevated"
          style={{ border: '1px solid #1e293b' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Choose from Gallery
        </button>

        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Shutter button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 flex flex-col items-center gap-3 pb-12"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}
      >
        <p className="text-text-muted text-xs">Tap to open camera</p>
        <button
          id="shutter-btn"
          onClick={handleCameraClick}
          className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'white',
            boxShadow: '0 0 0 4px rgba(255,255,255,0.25), 0 0 24px rgba(0,212,255,0.3)',
          }}
        >
          <div className="w-14 h-14 rounded-full" style={{ background: '#e2e8f0', border: '3px solid #0a0f1e' }} />
        </button>
      </motion.div>
    </motion.div>
  );
}
