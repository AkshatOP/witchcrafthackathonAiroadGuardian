# AI Road Guardian — Frontend UI Design Specification
**For:** Antigravity (UI Designer)
**Prepared by:** Engineering Lead
**Date:** 2026-05-08
**Phase:** 2 — Frontend UI Only (no Phase 3 routing logic yet)

---

## 1. Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#0a0f1e` | Page background, map overlay panels |
| `bg-surface` | `#0f172a` | Cards, drawers, modals |
| `bg-elevated` | `#1e293b` | Input fields, hover states |
| `accent-cyan` | `#00d4ff` | Primary brand color, active elements, route highlight |
| `accent-cyan-dim` | `#00d4ff33` | Glow shadows, subtle fills |
| `text-primary` | `#e2e8f0` | All body text |
| `text-muted` | `#94a3b8` | Labels, subtitles, placeholders |
| `text-inverse` | `#0a0f1e` | Text on bright backgrounds |
| `severity-low` | `#22c55e` | Green — low severity markers |
| `severity-medium` | `#eab308` | Yellow — medium severity markers |
| `severity-severe` | `#ef4444` | Red — severe severity markers |
| `border-subtle` | `#1e293b` | Panel borders |
| `border-glow` | `#00d4ff55` | Active input borders, focused states |

### 1.2 Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| App name / hero | Inter or Rajdhani | 20px | 700 |
| Section heading | Inter | 16px | 600 |
| Body / labels | Inter | 14px | 400 |
| Small / meta | Inter | 12px | 400 |
| Monospace (DIGIPIN, coords) | JetBrains Mono or Fira Code | 12px | 400 |

> Use Google Fonts: `Inter` (all weights) + `JetBrains Mono` (DIGIPIN display)

### 1.3 Spacing System
- Base unit: 4px
- Standard card padding: 16px
- Map overlay padding: 12px
- Border radius: 12px (cards), 8px (inputs/buttons), 50% (icon buttons)

### 1.4 Elevation / Shadow
```
shadow-glow-cyan:   0 0 16px #00d4ff44
shadow-glow-red:    0 0 16px #ef444444
shadow-glow-yellow: 0 0 16px #eab30844
shadow-glow-green:  0 0 16px #22c55e44
shadow-card:        0 4px 24px rgba(0,0,0,0.6)
```

### 1.5 Animation Principles
- All panels: `framer-motion` `y: 20 → 0, opacity: 0 → 1, duration: 0.3s, ease: easeOut`
- Marker pulse: CSS keyframe `scale(1) → scale(1.4) → scale(1)`, infinite, 2s
- Route line: SVG stroke-dashoffset animation, 1.5s ease-in-out
- Skeleton loaders: shimmer from left to right, `#1e293b → #2d3f5a → #1e293b`

---

## 2. Responsive Breakpoints

| Breakpoint | Width | Layout Mode |
|---|---|---|
| Mobile (primary) | < 768px | Single-column, bottom sheets, full-screen map |
| Tablet | 768–1024px | Hybrid — side panel 360px + map |
| Desktop / Laptop | > 1024px | Side panel 400px fixed + full-height map |

**Design-first priority: Mobile.** Desktop is an extension, not the primary canvas.

---

## 3. Screen Architecture

### Overall Layout (Mobile)
```
┌──────────────────────────────┐
│  TOP BAR                     │  ← Search: Location A → Location B
│  [≡] [📍 Current → 🔍 Search]│
├──────────────────────────────┤
│                              │
│                              │
│       FULL-SCREEN MAP        │  ← CartoDB Dark Matter tiles
│    (potholes auto-loaded)    │  ← Glowing severity markers
│                              │
│                              │
├──────────────────────────────┤
│  BOTTOM SHEET (collapsed)    │  ← Swipe up to expand
│  ● 24 potholes near you      │
└──────────────────────────────┘
         [ + ] FAB              ← Fixed bottom-right, report button
```

### Overall Layout (Desktop/Laptop)
```
┌──────────────┬───────────────────────────────────────────┐
│  SIDE PANEL  │                                           │
│  400px fixed │                                           │
│              │                                           │
│  [Search A]  │           FULL-HEIGHT MAP                 │
│  [Search B]  │      (potholes auto-loaded)               │
│              │                                           │
│  [Stats]     │                                           │
│  [Report     │                                           │
│   Feed]      │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

---

## 4. Component Specifications

---

### 4.1 Top Navigation Bar

**Mobile:**
```
┌─────────────────────────────────────────────────────┐
│  [≡]  🛡 AI Road Guardian              [📍] [🔔]   │
└─────────────────────────────────────────────────────┘
```
- Height: 56px
- Background: `#0a0f1e` with `backdrop-filter: blur(12px)`, `border-bottom: 1px solid #1e293b`
- Logo: shield icon (cyan) + "AI Road Guardian" text in accent cyan
- Left: hamburger icon `≡` (24px, `#e2e8f0`)
- Right: GPS location icon + notification bell (optional)
- Position: `fixed top-0`, `z-index: 100`

**Desktop:**
- Same bar but hamburger hidden, logo left-aligned in side panel header

---

### 4.2 Search Bar — Route Input (Top Priority Component)

**Mobile — Collapsed State (default):**
```
┌─────────────────────────────────────────────────────┐
│  🔍  Where do you want to go?                       │
└─────────────────────────────────────────────────────┘
```
Single compact search pill, tapping expands to full route input.

**Mobile — Expanded State (after tap):**
```
┌─────────────────────────────────────────────────────┐
│  ← [Back]                                           │
├─────────────────────────────────────────────────────┤
│  🔵  📍 Your current location          [GPS icon]   │  ← Location A
│  ─────────────────────────────────                  │
│  🔴  🔍 Enter destination...                        │  ← Location B
├─────────────────────────────────────────────────────┤
│  SUGGESTIONS (Google Maps style):                   │
│  ┌─────────────────────────────────────────────┐    │
│  │  📍  Lalbagh Botanical Garden, Bengaluru     │    │
│  │  📍  MG Road Metro Station, Bengaluru        │    │
│  │  📍  Indiranagar, Bengaluru                  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Tapping "Your current location" triggers `navigator.geolocation.getCurrentPosition()`
- Shows GPS loading spinner while acquiring location
- Typing in either field triggers address autocomplete
- **Autocomplete source:** OpenStreetMap Nominatim API (free, no API key needed) OR Google Places API if key available
  - Nominatim endpoint: `https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5&countrycodes=in`
  - Debounced: 300ms after last keystroke
- Each suggestion shows: place name (bold) + full address (muted)
- Suggestion icon: colored dot (🔵 for A, 🔴 for B)

**Styling:**
- Input background: `#1e293b`
- Active input border: `1px solid #00d4ff`, glow `0 0 8px #00d4ff44`
- Suggestions panel: `#0f172a`, `border-radius: 12px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.8)`
- Suggestion hover: `#1e293b`

**Desktop:**
- Two separate stacked input fields always visible in left panel (never collapses)
- "Get Route" button below both fields: full-width, cyan background, `#0a0f1e` text

---

### 4.3 Map Component

**Tile Layer:** CartoDB Dark Matter
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
Attribution: `© OpenStreetMap contributors © CARTO`

**Initial View:**
- Center: User's GPS location (if granted), else fallback to `[20.5937, 78.9629]` (center of India)
- Zoom: 14 (street level) on GPS, 5 (country level) on fallback
- Auto-load all pothole markers from `GET /api/v1/potholes` on mount

**Map Controls:**
- Zoom buttons: hidden on mobile (pinch to zoom), visible on desktop (bottom-right, styled dark)
- Attribution: bottom-left, tiny, muted text

**Route Overlay (Phase 2 UI shell — no logic yet):**
- When both A and B are filled, show a placeholder blue animated polyline on the map
- The polyline animates from A to B using stroke-dashoffset CSS animation
- Color: `#00d4ff` (cyan), width: 6px, `lineCap: round`, `lineJoin: round`
- Glow effect: secondary polyline, `#00d4ff55`, width: 16px, blurred
- Animation: line "draws" from A to B over 1.5s on route selection

---

### 4.4 Pothole Markers

Each marker is a glowing pulsing circle. No default Leaflet marker pins.

**Marker Design:**

```
Severe:
  Outer ring (pulse): rgba(239,68,68,0.2), 32px, animating scale 1→1.5→1
  Inner dot:          #ef4444, 12px, solid
  Glow:               0 0 12px #ef4444

Medium:
  Outer ring (pulse): rgba(234,179,8,0.2), 28px
  Inner dot:          #eab308, 10px
  Glow:               0 0 10px #eab308

Low:
  Outer ring (pulse): rgba(34,197,94,0.2), 24px
  Inner dot:          #22c55e, 8px
  Glow:               0 0 8px #22c55e
```

**Marker Popup (on tap/click):**
```
┌────────────────────────────────────────┐
│  🔴 SEVERE POTHOLE                     │
│  ────────────────────────────────      │
│  Confidence    ████████░░  78.1%       │
│  DIGIPIN       7HH-SNN-CKZF            │  ← monospace font
│  Status        ● Pending               │
│  Reported      2 hours ago             │
│                                        │
│  [  View Photo  ]  [  Get Route  ]     │
└────────────────────────────────────────┘
```
- Background: `#0f172a`, `border: 1px solid #1e293b`
- Confidence: colored progress bar matching severity color
- DIGIPIN: monospace, cyan color, copy-on-tap
- "View Photo": opens image in lightbox modal
- "Get Route": prefills destination B with this pothole's coordinates

---

### 4.5 Bottom Sheet (Mobile Only)

**Collapsed State (default):**
```
┌────────────────────────────────────────┐
│  ▔▔▔▔▔  (drag handle)                  │
│  24 potholes in this area              │
│  🔴 8 Severe   🟡 11 Medium   🟢 5 Low │
└────────────────────────────────────────┘
```
Height: ~80px, docked at bottom. Swipe up to expand.

**Expanded State (swipe up):**
```
┌────────────────────────────────────────┐
│  ▔▔▔▔▔                                 │
│  Potholes Near You              [Filter▾]
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🔴  Koramangala 5th Block        │  │
│  │     Severe · 87% · 3 mins ago    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🟡  Indiranagar 100ft Road       │  │
│  │     Medium · 62% · 12 mins ago   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 🟢  MG Road near Empire Hotel    │  │
│  │     Low · 44% · 1 hour ago       │  │
│  └──────────────────────────────────┘  │
│  ...                                   │
└────────────────────────────────────────┘
```
- Each row: tapping flies map to that pothole + opens popup
- Filter chip: All / Severe / Medium / Low
- Scroll within expanded sheet

---

### 4.6 Hamburger Menu (Slide-in Drawer)

Triggered by `≡` icon top-left.

```
┌─────────────────────────────────┐
│  ✕                              │
│                                 │
│  🛡 AI Road Guardian            │
│  Smart City Pothole Platform    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  📷  Report a Pothole           │  ← PRIMARY CTA — opens camera flow
│                                 │
│  🗺  View All Reports           │
│                                 │
│  📊  Statistics                 │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ℹ️  About                      │
│                                 │
│  Total Reports: 1,248           │  ← Live stat
│  Resolved Today: 12             │
│                                 │
└─────────────────────────────────┘
```

- Drawer slides in from LEFT, width: 280px (mobile), 320px (desktop)
- Backdrop: `rgba(0,0,0,0.6)` blur behind drawer
- Background: `#0f172a`
- "Report a Pothole" row: highlighted with cyan left border `4px`, text cyan
- Entry animation: `x: -280 → 0`, `opacity: 0 → 1`, duration 0.3s

---

### 4.7 Camera / Report Flow

Triggered from hamburger menu → "📷 Report a Pothole"

**Step 1 — Capture Screen (full-screen modal):**
```
┌────────────────────────────────────────┐
│  ← Cancel                             │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │     CAMERA VIEWFINDER            │  │
│  │     (live camera feed)           │  │
│  │                                  │  │
│  │     or                           │  │
│  │                                  │  │
│  │  [ 📁 Choose from Gallery ]      │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│          [ ⭕ CAPTURE ]                │  ← Large shutter button, white circle
│                                        │
└────────────────────────────────────────┘
```
- Camera access via `<input type="file" accept="image/*" capture="environment">`
- On mobile: triggers native camera
- Gallery option: same input without `capture` attribute
- Shutter button: 72px white circle, `box-shadow: 0 0 0 4px #ffffff44`

**Step 2 — Preview + Location Screen:**
```
┌────────────────────────────────────────┐
│  ← Back             Step 2 of 3       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │   [captured image preview]       │  │
│  │   640×480 thumbnail              │  │
│  └──────────────────────────────────┘  │
│                                        │
│  📍 Location                           │
│  ┌──────────────────────────────────┐  │
│  │ 📡 Detecting your location...    │  │  ← spinner while GPS loads
│  └──────────────────────────────────┘  │
│  OR                                    │
│  ┌──────────────────────────────────┐  │
│  │ 📌 12.9716° N, 77.5946° E        │  │  ← auto-filled from GPS
│  └──────────────────────────────────┘  │
│                                        │
│  [ Retake ]       [ Analyze Pothole → ]│
└────────────────────────────────────────┘
```

**Step 3 — AI Processing Screen:**
```
┌────────────────────────────────────────┐
│  ← Back             Step 3 of 3       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │   [image with bbox overlay]      │  │  ← bounding box drawn over pothole
│  └──────────────────────────────────┘  │
│                                        │
│  ✅ POTHOLE DETECTED                   │  ← or ❌ No Pothole Found
│                                        │
│  Severity     🔴 SEVERE                │
│  Confidence   ████████░░  78.1%        │
│  Location     12.9716° N, 77.5946° E   │
│  DIGIPIN      7HH-SNN-CKZF             │
│                                        │
│  ────────────────────────────────      │
│                                        │
│  [ Discard ]      [ Submit Report ✓ ]  │
└────────────────────────────────────────┘
```
- While AI processes: show a pulsing "Analyzing road surface with AI..." skeleton + spinner
- On success: slide in the result card with Framer Motion
- Bounding box: drawn using Canvas API over the image
- Severity badge: pill shape, background = severity color at 20% opacity, text = severity color, border = severity color
- Submit button: cyan background, `#0a0f1e` text, full-width

**Step 4 — Success Screen (brief, then auto-dismiss):**
```
┌────────────────────────────────────────┐
│                                        │
│          ✅                            │
│                                        │
│    Report Submitted!                   │
│                                        │
│    Your report has been added          │
│    to the map. Thank you for           │
│    keeping roads safer.                │
│                                        │
│    [ View on Map ]                     │
│                                        │
└────────────────────────────────────────┘
```
- Auto-dismiss after 3 seconds
- Map flies to newly reported pothole
- New marker appears on map with entry animation (scale 0 → 1, glow effect)

---

### 4.8 FAB — Floating Action Button (Mobile)

```
         ╔═══╗
         ║ + ║   ← 56px circle, background: #00d4ff, icon: white +
         ╚═══╝
         bottom-right, 24px from edges
```

- Tap: same as hamburger → "Report a Pothole" (shortcut to camera flow)
- On scroll down: shrinks to icon-only version
- Glow: `box-shadow: 0 0 20px #00d4ff66`

---

### 4.9 Stats Strip / Dashboard Panel

**Mobile (inside expanded bottom sheet):**
```
┌────────────────────────────────────────┐
│  Total   🔴 Severe   🟡 Medium  🟢 Low │
│    48       12          21        15   │
└────────────────────────────────────────┘
```

**Desktop (top of left panel, below search):**
```
┌──────────┬───────────┬──────────┬──────────┐
│  Total   │  Severe   │  Medium  │  Low     │
│   48     │    12     │    21    │    15    │
│ reports  │ 🔴 25%    │ 🟡 44%   │ 🟢 31%   │
└──────────┴───────────┴──────────┴──────────┘
```
- Numbers animate up (count-up animation) on first render
- Pulled from `GET /api/v1/potholes/stats`

---

### 4.10 Severity Legend

Always-visible overlay on map (bottom-left on mobile, top-right of map on desktop):
```
┌──────────────────────┐
│  🔴  Severe          │
│  🟡  Medium          │
│  🟢  Low             │
└──────────────────────┘
```
- Background: `rgba(10,15,30,0.85)`, blur
- Border: `1px solid #1e293b`
- Dots are actual styled divs with glow, not emoji

---

## 5. Route Highlight UI (Phase 2 Shell — No Logic)

When both Location A and Location B are filled:

1. A "Get Route" button appears / becomes active (cyan, full-width)
2. On tap: show a loading state on the map "Finding smoothest route..."
3. Display a **blue animated polyline** from A to B
   - The line animates like it's being "drawn" — stroke-dashoffset from total-length to 0
   - Duration: 1.5s, easing: ease-in-out
   - Color: `#00d4ff`, width: 5px, rounded caps
   - Glow layer: `#00d4ff44`, width: 14px, underneath
4. Route info card appears at bottom (mobile: bottom sheet, desktop: panel):

```
┌────────────────────────────────────────┐
│  📍 MG Road → Koramangala              │
│  ────────────────────────────────      │
│  🔵 Smoothest Route    4.2 km          │
│     ⚠️ 3 potholes en route             │
│                                        │
│  ⬜ Shortest Route     3.8 km          │
│     ⚠️ 11 potholes en route            │
│                                        │
│  [ Choose Smoothest ]                  │
└────────────────────────────────────────┘
```
> Note: Actual route data and pothole counts are placeholder/hardcoded for Phase 2. Real routing logic comes in Phase 3.

---

## 6. Loading & Empty States

### Map Loading (initial)
- Full-screen dark background with animated cyan radar pulse from center
- Text: "Loading road data..." in muted color

### No Potholes in Area
```
┌────────────────────────────────────────┐
│                                        │
│     🟢  Clean Roads Detected           │
│     No potholes reported nearby.       │
│                                        │
└────────────────────────────────────────┘
```

### Image Upload — AI Processing Skeleton
```
┌────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← shimmer
│  Analyzing with YOLOv8 AI...           │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░  35%          │  ← progress bar
└────────────────────────────────────────┘
```

---

## 7. Mobile-Specific Interactions

| Gesture | Action |
|---|---|
| Swipe up on bottom sheet | Expand report list |
| Swipe down on bottom sheet | Collapse to mini |
| Pinch to zoom | Map zoom |
| Tap marker | Open popup |
| Long press on map | Start reporting at that location |
| Swipe left on drawer | Close drawer |
| Pull-to-refresh (bottom sheet) | Reload potholes |

---

## 8. Micro-interactions & Animations Checklist

| Element | Animation |
|---|---|
| Page load | Fade in map, then markers stagger-appear (0.05s delay each) |
| New marker (realtime) | Scale 0→1.2→1 with glow burst, 0.4s |
| Marker pulse | Continuous ring expansion, infinite, 2s |
| Drawer open | Slide in from left, 0.3s easeOut |
| Bottom sheet expand | Spring physics, damping 20 |
| Route line draw | Stroke-dashoffset animate, 1.5s |
| Stats count-up | Number counts from 0 to value, 0.8s |
| Submit success | Checkmark scale + fade, then confetti burst (small, on-brand cyan) |
| Button press | Scale 0.97, 0.1s |
| Card entrance | y:20→0, opacity:0→1, 0.25s |

---

## 9. Assets Needed from Designer

- [ ] App icon / shield logo (SVG) in cyan
- [ ] Splash screen (mobile: 375×812, 390×844)
- [ ] Empty state illustrations (clean road, no potholes)
- [ ] Loading animation (radar pulse — can be Lottie)
- [ ] Onboarding screens (optional, if time permits): 3 slides explaining the app

---

## 10. Tech Notes for Developer (after design handoff)

- Framework: React 18 + Vite
- Styling: TailwindCSS (utility only, no custom CSS classes)
- Map: `react-leaflet` + `leaflet`
- Animations: `framer-motion` (all transitions)
- Address autocomplete: Nominatim API (OSM) — free, no key, add `User-Agent` header
- Camera: HTML5 `<input type="file" accept="image/*" capture="environment">`
- GPS: `navigator.geolocation.getCurrentPosition()`
- Realtime: Supabase JS client `supabase.channel('potholes').on('INSERT', ...)`
- State: React Context or Zustand (lightweight)
- HTTP: `axios` to backend at `http://localhost:3001`

---

## 11. Screen List (Complete)

| Screen | Mobile | Desktop |
|---|---|---|
| Map Home (default) | ✅ | ✅ |
| Search Expanded (route A→B) | ✅ | ✅ (side panel) |
| Hamburger Drawer | ✅ | ✅ |
| Report — Camera Capture | ✅ | ✅ (file upload) |
| Report — Preview + Location | ✅ | ✅ |
| Report — AI Result | ✅ | ✅ |
| Report — Success | ✅ | ✅ |
| Marker Popup | ✅ | ✅ |
| Bottom Sheet (mobile feed) | ✅ | — |
| Route Result Card | ✅ | ✅ (side panel) |
| Stats View | ✅ (in sheet) | ✅ (in panel) |

---

## 12. What is NOT in Phase 2 (for Phase 3)

- Actual route computation (OSRM API calls)
- Pothole density scoring along routes
- Route comparison (real data)
- Admin dashboard
- Authentication

The route UI shell (search bars, blue line animation, route card) is built in Phase 2 but all data is placeholder. Phase 3 wires the real routing engine.
