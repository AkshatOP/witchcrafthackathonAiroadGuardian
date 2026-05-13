import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Potholes
  potholes: [],
  stats: { total: 0, severe: 0, medium: 0, low: 0 },
  isLoadingPotholes: true,

  // Map
  mapRef: null,
  mapCenter: [20.5937, 78.9629],
  mapZoom: 5,
  userLocation: null,

  // Route
  locationA: null,   // { label, lat, lng }
  locationB: null,   // { label, lat, lng }
  routeActive: false,
  routeData: null,        // { smoothest, shortest } from backend
  activeRoute: 'smoothest', // 'smoothest' | 'shortest'
  routeLoading: false,

  // UI State
  isDrawerOpen: false,
  isSearchExpanded: false,
  isBottomSheetExpanded: false,
  reportFlowStep: null,   // null | 'capture' | 'preview' | 'result' | 'success'
  capturedImage: null,    // { file, preview }
  aiResult: null,         // { detected, severity, confidence, digipin, bbox }
  selectedPothole: null,

  // Severity filter
  severityFilter: 'all',

  // Setters
  setPotholes: (potholes) => set({ potholes }),
  setStats: (stats) => set({ stats }),
  setLoadingPotholes: (v) => set({ isLoadingPotholes: v }),
  setMapRef: (ref) => set({ mapRef: ref }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setLocationA: (loc) => set({ locationA: loc }),
  setLocationB: (loc) => set({ locationB: loc }),
  setRouteActive: (v) => set({ routeActive: v }),
  setRouteData: (data) => set({ routeData: data }),
  setActiveRoute: (r) => set({ activeRoute: r }),
  setRouteLoading: (v) => set({ routeLoading: v }),
  setDrawerOpen: (v) => set({ isDrawerOpen: v }),
  setSearchExpanded: (v) => set({ isSearchExpanded: v }),
  setBottomSheetExpanded: (v) => set({ isBottomSheetExpanded: v }),
  setReportFlowStep: (step) => set({ reportFlowStep: step }),
  setCapturedImage: (img) => set({ capturedImage: img }),
  setAiResult: (result) => set({ aiResult: result }),
  setSelectedPothole: (p) => set({ selectedPothole: p }),
  setSeverityFilter: (f) => set({ severityFilter: f }),

  addPothole: (pothole) =>
    set((state) => ({ potholes: [pothole, ...state.potholes] })),

  removePothole: (id) =>
    set((state) => ({ potholes: state.potholes.filter((p) => p.id !== id) })),

  clearRoute: () =>
    set({ locationA: null, locationB: null, routeActive: false, routeData: null, activeRoute: 'smoothest', routeLoading: false }),

  openReportFlow: () =>
    set({ reportFlowStep: 'capture', isDrawerOpen: false }),

  closeReportFlow: () =>
    set({ reportFlowStep: null, capturedImage: null, aiResult: null }),

  filteredPotholes: () => {
    const { potholes, severityFilter } = get();
    if (severityFilter === 'all') return potholes;
    return potholes.filter((p) => p.severity === severityFilter);
  },
}));
