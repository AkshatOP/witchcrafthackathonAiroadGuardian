import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAddress, fetchRoute } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SuggestionItem({ result, color, onSelect }) {
  const name = result.name || result.display_name?.split(',')[0] || '';
  const address = result.display_name || '';
  return (
    <button
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-elevated"
      onClick={() =>
        onSelect({
          label: result.display_name,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        })
      }
    >
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
        style={{ background: color }}
      />
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{name}</p>
        <p className="text-text-muted text-xs truncate">{address}</p>
      </div>
    </button>
  );
}

function LocationInput({ label, value, onChange, placeholder, color, onGPS, showGPS, id }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
        autoComplete="off"
      />
      {showGPS && (
        <button
          onClick={onGPS}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
          style={{ color: '#00d4ff', background: '#00d4ff14', border: '1px solid #00d4ff33' }}
          title="Use current GPS location"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
          </svg>
          GPS
        </button>
      )}
    </div>
  );
}

export default function SearchBar() {
  const {
    isSearchExpanded,
    setSearchExpanded,
    locationA,
    setLocationA,
    locationB,
    setLocationB,
    setRouteActive,
    setRouteData,
    setRouteLoading,
    userLocation,
    mapRef,
    clearRoute,
  } = useAppStore();

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [activeField, setActiveField] = useState(null); // 'a' | 'b'
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const debouncedA = useDebounce(inputA, 300);
  const debouncedB = useDebounce(inputB, 300);

  // Sync store → input
  useEffect(() => { if (locationA) setInputA(locationA.label || ''); }, [locationA]);
  useEffect(() => { if (locationB) setInputB(locationB.label || ''); }, [locationB]);

  // When search opens with a destination but no origin, auto-fill A from GPS
  useEffect(() => {
    if (!isSearchExpanded) return;
    if (locationA) return; // already set
    if (!userLocation) return;
    const loc = {
      label: 'Your current location',
      lat: userLocation.lat,
      lng: userLocation.lng,
    };
    setLocationA(loc);
    setInputA('Your current location');
  }, [isSearchExpanded]);

  // Autocomplete
  useEffect(() => {
    const query = activeField === 'a' ? debouncedA : activeField === 'b' ? debouncedB : '';
    if (!query || query.length < 3) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    searchAddress(query)
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [debouncedA, debouncedB, activeField]);

  const handleSelectA = (loc) => {
    setLocationA(loc);
    setInputA(loc.label);
    setSuggestions([]);
    if (mapRef) mapRef.flyTo([loc.lat, loc.lng], 15);
  };

  const handleSelectB = (loc) => {
    setLocationB(loc);
    setInputB(loc.label);
    setSuggestions([]);
    if (mapRef) mapRef.flyTo([loc.lat, loc.lng], 15);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          label: `📍 ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocationA(loc);
        setInputA('Your current location');
        setGpsLoading(false);
        if (mapRef) mapRef.flyTo([loc.lat, loc.lng], 15);
      },
      () => setGpsLoading(false)
    );
  };

  const handleGetRoute = async () => {
    if (!locationA || !locationB) return;
    setRouteLoading(true);
    setRouteActive(true);
    setSearchExpanded(false);
    try {
      const res = await fetchRoute(locationA.lat, locationA.lng, locationB.lat, locationB.lng);
      if (res.success && res.data) {
        setRouteData(res.data);
        // Fit map to smoothest route bounds
        const routeCoords = res.data.smoothest?.coords || res.data.shortest?.coords;
        if (routeCoords && mapRef) {
          const lats = routeCoords.map(([, lat]) => lat);
          const lngs = routeCoords.map(([lng]) => lng);
          mapRef.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [60, 60] });
        }
      }
    } catch (e) {
      console.warn('Route fetch failed:', e.message);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClose = () => {
    setSearchExpanded(false);
    setSuggestions([]);
  };

  return (
    <>
      {/* Collapsed pill */}
      <AnimatePresence>
        {!isSearchExpanded && (
          <motion.div
            key="search-pill"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[90] flex px-4"
            style={{ paddingTop: '68px' }}
          >
            <button
              id="search-pill-btn"
              onClick={() => setSearchExpanded(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted transition-all"
              style={{
                background: 'rgba(15,23,42,0.98)',
                border: '1px solid rgba(0,212,255,0.35)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,212,255,0.08)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Where do you want to go?</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            key="search-expanded"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[90]"
            style={{
              paddingTop: '56px',
              background: 'rgba(10,15,30,0.99)',
              minHeight: '180px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.9)',
              borderBottom: '1px solid rgba(0,212,255,0.15)',
            }}
          >
            {/* Back button */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1e293b' }}>
              <button
                id="search-back-btn"
                onClick={handleClose}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            {/* Input A */}
            <div
              className="mx-3 my-2 rounded-xl overflow-hidden"
              style={{
                background: '#1e293b',
                border: activeField === 'a' ? '1px solid #00d4ff' : '1px solid #1e293b',
                boxShadow: activeField === 'a' ? '0 0 8px #00d4ff33' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={() => setActiveField('a')}
            >
              {gpsLoading ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-3 h-3 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
                  <span className="text-text-muted text-sm">Detecting location...</span>
                </div>
              ) : (
                <LocationInput
                  id="location-a-input"
                  label="A"
                  value={inputA}
                  onChange={(v) => { setInputA(v); setActiveField('a'); }}
                  placeholder="📍 Your current location"
                  color="#00d4ff"
                  showGPS
                  onGPS={handleGPS}
                />
              )}
            </div>

            {/* Divider with swap */}
            <div className="flex items-center px-7 py-0.5">
              <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
              <div className="mx-2 w-px h-4" style={{ background: '#1e293b' }} />
            </div>

            {/* Input B */}
            <div
              className="mx-3 my-2 rounded-xl overflow-hidden"
              style={{
                background: '#1e293b',
                border: activeField === 'b' ? '1px solid #00d4ff' : '1px solid #1e293b',
                boxShadow: activeField === 'b' ? '0 0 8px #00d4ff33' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={() => setActiveField('b')}
            >
              <LocationInput
                id="location-b-input"
                label="B"
                value={inputB}
                onChange={(v) => { setInputB(v); setActiveField('b'); }}
                placeholder="🔍 Enter destination..."
                color="#ef4444"
              />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-3 mb-2 rounded-xl overflow-hidden"
                  style={{
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-text-muted text-sm">Searching...</div>
                  ) : (
                    suggestions.map((r, i) => (
                      <SuggestionItem
                        key={i}
                        result={r}
                        color={activeField === 'a' ? '#00d4ff' : '#ef4444'}
                        onSelect={activeField === 'a' ? handleSelectA : handleSelectB}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Get Route button */}
            {locationA && locationB && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-3 mb-4"
              >
                <button
                  id="get-route-btn"
                  onClick={handleGetRoute}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: '#00d4ff',
                    color: '#0a0f1e',
                    boxShadow: '0 0 20px #00d4ff44',
                  }}
                >
                  Get Route →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
