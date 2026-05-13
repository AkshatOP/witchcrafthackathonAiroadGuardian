import { useAppStore } from '../../store/appStore';

// Shield SVG icon
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 6.5V12c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6.5L12 2z"
      fill="#00d4ff"
      stroke="#00d4ff"
      strokeWidth="0.5"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="#0a0f1e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navbar() {
  const { setDrawerOpen, isDrawerOpen, setSearchExpanded, isSearchExpanded } = useAppStore();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4"
      style={{
        height: '56px',
        background: 'rgba(10,15,30,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,212,255,0.3)',
        boxShadow: '0 1px 0 rgba(0,212,255,0.1), 0 4px 24px rgba(0,0,0,0.9)',
      }}
    >
      {/* Left: Hamburger */}
      <button
        id="hamburger-btn"
        onClick={() => setDrawerOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-bg-elevated transition-colors"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4"  width="16" height="2" rx="1" fill="#e2e8f0" />
          <rect x="2" y="9"  width="16" height="2" rx="1" fill="#e2e8f0" />
          <rect x="2" y="14" width="16" height="2" rx="1" fill="#e2e8f0" />
        </svg>
      </button>

      {/* Center: Logo */}
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <ShieldIcon />
        <span
          className="font-bold text-accent-cyan tracking-tight"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', letterSpacing: '0.04em' }}
        >
          AI Road Guardian
        </span>
      </div>

      {/* Right: GPS + Bell */}
      <div className="flex items-center gap-1">
        <button
          id="gps-nav-btn"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-bg-elevated transition-colors text-text-muted hover:text-accent-cyan"
          aria-label="My location"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                useAppStore.getState().setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                const mapRef = useAppStore.getState().mapRef;
                if (mapRef) mapRef.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
              });
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
          </svg>
        </button>
        <button
          id="notifications-btn"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-bg-elevated transition-colors text-text-muted hover:text-accent-cyan"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
