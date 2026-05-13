import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

function Confetti() {
  const pieces = Array.from({ length: 12 });
  const colors = ['#00d4ff', '#0ea5e9', '#22c55e', '#00ffcc', '#38bdf8'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute confetti-piece"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: '30%',
            width: i % 2 === 0 ? '8px' : '6px',
            height: i % 2 === 0 ? '8px' : '12px',
            borderRadius: i % 3 === 0 ? '50%' : '2px',
            background: colors[i % colors.length],
            animationDelay: `${i * 0.08}s`,
            animationDuration: `${0.8 + (i % 3) * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function SuccessScreen() {
  const { closeReportFlow, aiResult, mapRef } = useAppStore();

  useEffect(() => {
    // Auto-dismiss after 4s
    const timer = setTimeout(() => {
      closeReportFlow();
    }, 4000);
    return () => clearTimeout(timer);
  }, [closeReportFlow]);

  const handleViewOnMap = () => {
    if (aiResult?.latitude && aiResult?.longitude && mapRef) {
      mapRef.flyTo([aiResult.latitude, aiResult.longitude], 18);
    }
    closeReportFlow();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0f1e' }}
    >
      <Confetti />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="flex flex-col items-center gap-6 text-center max-w-sm"
      >
        {/* Checkmark */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: '#22c55e1a', border: '2px solid #22c55e44', boxShadow: '0 0 32px #22c55e44' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            className="text-5xl"
          >
            ✅
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-text-primary text-2xl font-bold mb-3">Report Submitted!</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Your report has been added to the map.<br />
            Thank you for keeping roads safer.
          </p>
        </motion.div>

        {/* Button */}
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          id="view-on-map-btn"
          onClick={handleViewOnMap}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all"
          style={{ background: '#00d4ff', color: '#0a0f1e', boxShadow: '0 0 20px #00d4ff66' }}
        >
          View on Map
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-text-muted text-xs"
        >
          Auto-closing in 4 seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
