# Smart City Resurgence: AI-Driven Urban Resilience 🚀

> **Witchhunt Women Hackathon Submission**
> **Theme:** Smart Cities  
> **Problem Statement 1:** Innovative Solution for Smart Cities  
> **Objective:** Design AI-driven solutions for urban resilience, efficient public services, and improved quality of life in Indian cities.

---

## 📖 Overview

As urbanization accelerates across Indian cities, maintaining efficient public services and infrastructure resilience is more critical than ever. Our solution is a comprehensive, end-to-end platform designed to empower city administrators and citizens alike. By integrating real-time geographic data, advanced AI computer vision, and a scalable cloud database, we provide an intelligent dashboard that monitors infrastructure health, detects anomalies (such as road damage or public safety hazards), and streamlines service requests.

This project delivers actionable insights, automates problem detection, and maps everything interactively, fostering a truly "Smart" and resilient city ecosystem.

---

## 🏗️ System Architecture

Our platform is constructed using a robust microservices-inspired architecture, divided into three core pillars:

1. **Frontend (User Interface & Dashboard)**
   - Provides an interactive, map-based interface for city administrators.
   - Built for high performance, responsiveness, and real-time data tracking.
2. **Backend (API & Business Logic)**
   - Acts as the central nervous system, orchestrating data flow between the AI inference module, the database, and the frontend clients.
   - Handles secure uploads, data validation, and routing.
3. **AI Intelligence Engine (Computer Vision)**
   - Utilizes state-of-the-art object detection models (YOLOv8) to analyze visual data from city cameras or uploaded citizen reports.
   - Automatically identifies infrastructure defects and logs them geographically.

### 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React-Leaflet (Maps), Zustand (State Management), Framer Motion (Animations).
- **Backend:** Node.js, Express.js 5, Multer (File Handling), Morgan (Logging).
- **AI Module:** Python, PyTorch, YOLOv8 (Ultralytics).
- **Database/Auth:** Supabase (PostgreSQL).

---

## ✨ Key Features

- **🗺️ Interactive GIS Mapping:** Visualize the exact coordinates of infrastructure issues using integrated Leaflet maps.
- **🤖 Automated AI Detection:** Reduce manual reporting reliance. Our AI models analyze imagery to instantly detect and classify urban issues (e.g., potholes, waste accumulation).
- **📊 Real-time Dashboard:** City officials get a high-level overview of unresolved vs. resolved issues to optimize resource deployment.
- **☁️ Cloud-Native Storage:** Secure and scalable data storage utilizing Supabase for instantaneous synchronization across platforms.
- **📱 Responsive & Accessible:** Designed to work flawlessly on desktop monitors in a control room, or on tablets in the field.

---

## 🚀 Getting Started

The project is modular. To run the entire suite locally, you will need to set up each component individually. Detailed instructions are provided in their respective directories.

1. **[Frontend Setup & Documentation](./frontend/README.md)**
2. **[Backend Setup & Documentation](./backend/README.md)**
3. **[AI Module Setup & Documentation](./ai/README.md)**

---

## 🤝 Team
Developed with passion during the **Witchhunt Women Hackathon**, driven by the vision of safer, smarter, and more resilient Indian cities.
