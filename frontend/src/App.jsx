import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { usePotholes } from './hooks/usePotholes';
import { useGeolocation } from './hooks/useGeolocation';

// Layout
import Navbar from './components/Layout/Navbar';
import HamburgerDrawer from './components/Layout/HamburgerDrawer';

// Map
import PotholeMap from './components/Map/PotholeMap';

// Search / Route
import SearchBar from './components/Search/SearchBar';
import RouteCard from './components/Route/RouteCard';

// Report flow
import CaptureScreen from './components/Report/CaptureScreen';
import PreviewScreen from './components/Report/PreviewScreen';
import AIResultScreen from './components/Report/AIResultScreen';
import SuccessScreen from './components/Report/SuccessScreen';

// Mobile
import BottomSheet from './components/BottomSheet/BottomSheet';
import FAB from './components/FAB';

// Loading
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const {
    isLoadingPotholes,
    stats,
    reportFlowStep,
    routeActive,
    setUserLocation,
    setMapCenter,
    setMapZoom,
  } = useAppStore();

  // Initialize data hooks
  usePotholes();

  // Try to get user location on app start
  const { location, getLocation } = useGeolocation();
  useEffect(() => {
    getLocation();
  }, [getLocation]);
  useEffect(() => {
    if (location) {
      setUserLocation(location);
      const mapRef = useAppStore.getState().mapRef;
      if (mapRef) {
        mapRef.flyTo([location.lat, location.lng], 14);
      }
      setMapCenter([location.lat, location.lng]);
      setMapZoom(14);
    }
  }, [location, setUserLocation, setMapCenter, setMapZoom]);

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0f1e', isolation: 'isolate' }}>
      {/* ── Initial loading overlay ─────────────────────────────── */}
      <AnimatePresence>
        {isLoadingPotholes && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[500]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map (always rendered underneath) ──────────────────── */}
      <PotholeMap />

      {/* ── Top Navbar ────────────────────────────────────────── */}
      <Navbar />

      {/* ── Search Bar (over map, below navbar) ───────────────── */}
      <SearchBar />

      {/* ── Hamburger Drawer ──────────────────────────────────── */}
      <HamburgerDrawer stats={stats} />

      {/* ── Route card (always shown when route is active) ───── */}
      {routeActive && <RouteCard />}

      {/* ── Mobile only UI (hide bottom sheet when route active) */}
      {isMobile && !routeActive && <BottomSheet />}
      <FAB />

      {/* ── Report Flow (full-screen modals) ──────────────────── */}
      <AnimatePresence mode="wait">
        {reportFlowStep === 'capture' && <CaptureScreen key="capture" />}
        {reportFlowStep === 'preview' && <PreviewScreen key="preview" />}
        {reportFlowStep === 'result'  && <AIResultScreen key="result" />}
        {reportFlowStep === 'success' && <SuccessScreen key="success" />}
      </AnimatePresence>
    </div>
  );
}
