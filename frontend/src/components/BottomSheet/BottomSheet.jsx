import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import PotholeList from './PotholeList';
import StatsStrip from './StatsStrip';

const COLLAPSED_HEIGHT = 96;
const EXPANDED_HEIGHT_VH = 0.65; // 65% of viewport

export default function BottomSheet() {
  const { isBottomSheetExpanded, setBottomSheetExpanded, stats, filteredPotholes, severityFilter, setSeverityFilter } = useAppStore();
  const [viewportH, setViewportH] = useState(window.innerHeight);
  const y = useMotionValue(0);
  const sheetRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  const expandedHeight = Math.round(viewportH * EXPANDED_HEIGHT_VH);

  useEffect(() => {
    const handleResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const collapse = () => {
    setBottomSheetExpanded(false);
    animate(y, 0, { type: 'spring', damping: 20, stiffness: 200 });
  };

  const expand = () => {
    setBottomSheetExpanded(true);
    animate(y, -(expandedHeight - COLLAPSED_HEIGHT), { type: 'spring', damping: 20, stiffness: 200 });
  };

  const handleDragStart = (e) => {
    isDragging.current = true;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startY.current = clientY - y.get();
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newY = clientY - startY.current;
    const minY = -(expandedHeight - COLLAPSED_HEIGHT);
    y.set(Math.max(minY, Math.min(0, newY)));
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const current = y.get();
    const threshold = -(expandedHeight - COLLAPSED_HEIGHT) * 0.4;
    if (current < threshold) expand();
    else collapse();
  };

  const potholes = filteredPotholes();
  const total = stats.total || potholes.length;

  return (
    <motion.div
      ref={sheetRef}
      style={{
        y,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: expandedHeight,
        background: '#0f172a',
        borderTop: '1px solid rgba(0,212,255,0.25)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        zIndex: 70,
        willChange: 'transform',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.8), 0 -1px 0 rgba(0,212,255,0.1)',
        userSelect: 'none',
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Handle */}
      <div
        className="flex justify-center pt-3 pb-1 cursor-grab"
        onClick={() => isBottomSheetExpanded ? collapse() : expand()}
      >
        <div className="sheet-handle" />
      </div>

      {/* Summary row (always visible) */}
      <div className="px-4 pb-3" style={{ height: COLLAPSED_HEIGHT - 24 }}>
        <StatsStrip stats={stats} total={total} />
      </div>

      {/* Expanded content */}
      <div
        className="overflow-y-auto"
        style={{ height: expandedHeight - COLLAPSED_HEIGHT, paddingBottom: '80px' }}
      >
        {/* Header + filter */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-text-primary text-sm font-semibold">Potholes Near You</h3>
          <div className="flex gap-1">
            {['all', 'severe', 'medium', 'low'].map((f) => (
              <button
                key={f}
                id={`filter-${f}-btn`}
                onClick={() => setSeverityFilter(f)}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: severityFilter === f ? '#00d4ff' : '#1e293b',
                  color: severityFilter === f ? '#0a0f1e' : '#94a3b8',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Pull to refresh */}
        <PotholeList potholes={potholes} />
      </div>
    </motion.div>
  );
}
