import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';

export default function FAB() {
  const { openReportFlow, isBottomSheetExpanded, routeActive } = useAppStore();

  // Sit just above the route card when active, above bottom sheet on mobile
  const bottom = routeActive ? '210px' : isBottomSheetExpanded ? '240px' : '24px';

  return (
    <AnimatePresence>
      <motion.button
        id="fab-report-btn"
        key="fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 28px #00d4ffaa, 0 4px 16px rgba(0,0,0,0.6)' }}
        whileTap={{ scale: 0.93 }}
        onClick={openReportFlow}
        className="fixed z-[75] flex items-center gap-2 rounded-full px-4"
        style={{
          height: '48px',
          right: '16px',
          bottom,
          background: '#00d4ff',
          boxShadow: '0 0 20px #00d4ff66, 0 4px 12px rgba(0,0,0,0.5)',
          transition: 'bottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          color: '#0a0f1e',
        }}
        aria-label="Contribute — report a pothole"
      >
        {/* Camera icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span className="text-sm font-bold" style={{ color: '#0a0f1e', letterSpacing: '0.01em' }}>
          Contribute
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
