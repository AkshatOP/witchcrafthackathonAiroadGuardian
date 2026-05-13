import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

function kmStr(metres) {
  return metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`;
}

function minStr(seconds) {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function PotholeBreakdown({ potholes }) {
  if (!potholes || potholes.total === 0) {
    return <span className="text-severity-low text-xs font-medium">✅ Clear road</span>;
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-text-muted text-xs">⚠️ {potholes.total} potholes</span>
      {potholes.severe > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: '#ef444420', color: '#ef4444' }}>
          {potholes.severe} severe
        </span>
      )}
      {potholes.medium > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: '#eab30820', color: '#eab308' }}>
          {potholes.medium} medium
        </span>
      )}
      {potholes.low > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: '#22c55e20', color: '#22c55e' }}>
          {potholes.low} low
        </span>
      )}
    </div>
  );
}

function RouteRow({ route, label, active, onClick, color }) {
  const isGhost = !route;
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
      style={{
        border: active ? `2px solid ${color}` : '1px solid #1e293b',
        background: active ? `${color}0d` : 'transparent',
        opacity: isGhost ? 0.4 : 1,
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: active ? `0 0 6px ${color}` : 'none' }}
          />
          <span className="text-sm font-semibold" style={{ color: active ? color : '#94a3b8' }}>
            {label}
          </span>
        </div>
        <div className="ml-5">
          {isGhost
            ? <span className="text-text-muted text-xs">Same path as above</span>
            : <PotholeBreakdown potholes={route.potholes} />
          }
        </div>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        {route && (
          <>
            <div className="text-sm font-mono font-semibold" style={{ color: active ? color : '#94a3b8' }}>
              {kmStr(route.distance)}
            </div>
            <div className="text-text-muted text-xs">{minStr(route.duration)}</div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function RouteCard() {
  const {
    locationA, locationB, routeActive, routeData, routeLoading,
    activeRoute, setActiveRoute, clearRoute,
  } = useAppStore();

  if (!routeActive || !locationA || !locationB) return null;

  const fromLabel = locationA.label?.split(',')[0] || 'A';
  const toLabel   = locationB.label?.split(',')[0]  || 'B';

  const sameRoute = routeData &&
    JSON.stringify(routeData.smoothest?.coords) === JSON.stringify(routeData.shortest?.coords);

  return (
    <AnimatePresence>
      <motion.div
        key="route-card"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 z-[80] mx-3 mb-4"
        style={{
          background: '#0f172a',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '20px',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,212,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
            <span className="text-text-primary text-sm font-medium truncate">
              {fromLabel} → {toLabel}
            </span>
          </div>
          <button
            onClick={clearRoute}
            className="text-text-muted hover:text-text-primary text-xs ml-3 flex-shrink-0 transition-colors px-2 py-1 rounded-lg hover:bg-bg-elevated"
          >
            Clear ✕
          </button>
        </div>

        {/* Loading state */}
        {routeLoading && (
          <div className="px-4 py-6 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-text-muted text-sm">Calculating routes via OSRM…</span>
          </div>
        )}

        {/* Route comparison */}
        {!routeLoading && routeData && (
          <div className="p-3 space-y-2">
            <RouteRow
              route={routeData.smoothest}
              label="Smoothest Route"
              active={activeRoute === 'smoothest'}
              color="#00d4ff"
              onClick={() => setActiveRoute('smoothest')}
            />
            <RouteRow
              route={sameRoute ? null : routeData.shortest}
              label="Shortest Route"
              active={activeRoute === 'shortest'}
              color="#a78bfa"
              onClick={() => !sameRoute && setActiveRoute('shortest')}
            />
          </div>
        )}

        {/* No data yet */}
        {!routeLoading && !routeData && (
          <div className="px-4 py-4 text-center text-text-muted text-sm">
            Fetching route data…
          </div>
        )}

        {/* CTA */}
        {!routeLoading && routeData && (
          <div className="px-3 pb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeRoute === 'shortest' ? '#a78bfa' : '#00d4ff',
                color: '#0a0f1e',
                boxShadow: activeRoute === 'shortest' ? '0 0 20px #a78bfa44' : '0 0 20px #00d4ff44',
              }}
              onClick={() => setActiveRoute(activeRoute === 'smoothest' ? 'shortest' : 'smoothest')}
            >
              {activeRoute === 'smoothest' ? '✓ Taking Smoothest Route' : '✓ Taking Shortest Route'}
            </motion.button>

            {/* DIGIPIN note */}
            <p className="text-center text-text-muted text-xs mt-2">
              📍 Pothole pins include DIGIPIN codes for precision addressing
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
