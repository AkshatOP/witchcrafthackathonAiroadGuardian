# 🖥️ Frontend - Smart City Command Dashboard

Welcome to the Frontend component of our Smart City Resilience platform. This directory houses the React-based Single Page Application (SPA) that serves as the primary interface for city administrators, urban planners, and service workers.

## 🎯 Overview

The frontend is engineered to be lightning-fast, highly interactive, and visually intuitive. It transforms raw urban data into an accessible map-based dashboard. Users can view infrastructure anomalies, track public service requests, and monitor the overall health of the city's geographical layout in real-time.

## ⚙️ Tech Stack & Libraries

- **Core Framework:** [React 19](https://react.dev/) powered by [Vite](https://vitejs.dev/) for instantaneous HMR and optimized builds.
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) for rapid, utility-first UI design.
- **Mapping:** [Leaflet](https://leafletjs.com/) & `react-leaflet` to render interactive city maps and plot dynamic data points.
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for lightweight, scalable global state handling.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth, professional micro-interactions.
- **Data Fetching & API:** `axios` and `@supabase/supabase-js`.

## ✨ Core Features

- **Interactive Incident Map:** Pinpoints AI-detected infrastructure issues directly on a dynamic map.
- **Real-Time Updates:** Fetches the latest data seamlessly from the backend and Supabase.
- **Detailed Analytics Panels:** Slide-out panels and modals displaying the severity, exact coordinates, and AI confidence scores of detected issues.
- **Responsive Layout:** Optimized for both massive command-center displays and mobile devices for on-the-ground staff.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Dependencies
Navigate to the frontend directory and install the required packages:
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `frontend` directory. You will need to define your API endpoints and Supabase keys:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server
Run the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173` (or the port specified by Vite in your console).

### 4. Build for Production
To create a production-ready optimized bundle:
```bash
npm run build
```
You can preview the built application locally using:
```bash
npm run preview
```

## 📁 Directory Structure Overview
- `/src/components`: Reusable UI elements (Buttons, Modals, Map Markers).
- `/src/store`: Zustand state slices.
- `/src/utils`: Helper functions and API wrappers.
