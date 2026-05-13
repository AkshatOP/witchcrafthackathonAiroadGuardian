import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

const MenuItem = ({ icon, label, onClick, highlight, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all hover:bg-bg-elevated group ${
      highlight ? 'border-l-4 border-accent-cyan' : 'border-l-4 border-transparent'
    }`}
    style={{ borderRadius: highlight ? '0 8px 8px 0' : '0' }}
  >
    <span className="text-xl leading-none">{icon}</span>
    <span
      className={`text-sm font-medium transition-colors ${
        highlight ? 'text-accent-cyan' : 'text-text-primary group-hover:text-accent-cyan'
      }`}
    >
      {label}
    </span>
  </button>
);

export default function HamburgerDrawer({ stats }) {
  const { isDrawerOpen, setDrawerOpen, openReportFlow } = useAppStore();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[150]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 z-[200] flex flex-col overflow-hidden"
            style={{
              width: '280px',
              background: '#0f172a',
              borderRight: '1px solid #1e293b',
              boxShadow: '4px 0 32px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-4" style={{ borderBottom: '1px solid #1e293b' }}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#00d4ff">
                    <path d="M12 2L3 6.5V12c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6.5L12 2z" />
                    <path d="M9 12l2 2 4-4" stroke="#0a0f1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="text-accent-cyan font-bold text-base" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    AI Road Guardian
                  </span>
                </div>
                <p className="text-text-muted text-xs ml-6">Smart City Pothole Platform</p>
              </div>
              <button
                id="close-drawer-btn"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <MenuItem
                id="drawer-report-btn"
                icon="📷"
                label="Report a Pothole"
                highlight
                onClick={openReportFlow}
              />
              <MenuItem id="drawer-reports-btn" icon="🗺" label="View All Reports" onClick={() => setDrawerOpen(false)} />
              <MenuItem id="drawer-stats-btn" icon="📊" label="Statistics" onClick={() => setDrawerOpen(false)} />

              <div className="mx-5 my-3" style={{ height: '1px', background: '#1e293b' }} />

              <MenuItem id="drawer-about-btn" icon="ℹ️" label="About" onClick={() => {}} />
            </nav>

            {/* Footer Stats */}
            <div className="px-5 pb-6 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
              <div className="rounded-xl p-4" style={{ background: '#0a0f1e' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-text-muted text-xs">Total Reports</span>
                  <span className="text-text-primary text-xs font-semibold font-mono">
                    {(stats?.total ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-muted text-xs">🔴 Severe</span>
                  <span className="text-severity-severe text-xs font-semibold font-mono">{stats?.severe ?? 0}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-muted text-xs">🟡 Medium</span>
                  <span className="text-severity-medium text-xs font-semibold font-mono">{stats?.medium ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted text-xs">🟢 Low</span>
                  <span className="text-severity-low text-xs font-semibold font-mono">{stats?.low ?? 0}</span>
                </div>
              </div>
              <p className="text-text-muted text-xs text-center mt-3">v1.0 · Phase 2 MVP</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
