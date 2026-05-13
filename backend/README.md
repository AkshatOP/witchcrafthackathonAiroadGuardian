# ⚙️ Backend - Smart City API Gateway

This directory contains the robust Express.js backend that powers the Smart City Resilience platform. It acts as the critical intermediary connecting the frontend dashboard, the AI intelligence engine, and our cloud database.

## 🎯 Overview

Designed with scalability and reliability in mind, this backend handles incoming incident reports, orchestrates file uploads for image analysis, routes data to the AI inference engine, and communicates with Supabase for persistent, structured storage. It ensures that the heavy lifting of data validation and business logic is kept secure and efficient.

## ⚙️ Tech Stack & Libraries

- **Runtime & Framework:** Node.js with [Express.js 5](https://expressjs.com/).
- **Database Client:** `@supabase/supabase-js` for querying and mutations on our PostgreSQL cloud instance.
- **File Handling:** `multer` for parsing and managing image uploads from citizen apps or city cameras.
- **Networking:** `axios` for internal microservice communication (e.g., sending images to the Python AI server).
- **Security & Utilities:** `cors`, `dotenv` for environment management, `morgan` for HTTP request logging, and `uuid` for unique identifier generation.

## ✨ Core Features

- **RESTful API Design:** Clean, semantic endpoints for managing urban incidents, fetching map data, and updating service statuses.
- **Image Processing Pipeline:** Securely receives visual data (like photos of infrastructure damage) and forwards them to the AI module for object detection.
- **Centralized Error Handling:** Consistent and informative API responses for seamless frontend integration.
- **Logging & Monitoring:** Implements Morgan to keep track of traffic patterns and assist in debugging.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Dependencies
Navigate to the backend directory and install the packages:
```bash
cd backend
npm install
```

### 2. Environment Variables
Copy the template file to create your local `.env`:
```bash
cp .env.example .env
```
Ensure you populate it with the correct credentials:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
AI_SERVICE_URL=http://localhost:8000
```

### 3. Start the Server

**Development Mode (Auto-reloading):**
Utilizes `nodemon` to automatically restart the server upon file changes.
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```
The API will be available at `http://localhost:5000` (or your configured port).

## 📁 Directory Structure Overview
- `/controllers`: Request handlers containing the core business logic.
- `/routes`: Express route definitions connecting URLs to controllers.
- `/middleware`: Custom middleware for tasks like file uploading (`multer`) and validation.
- `/services`: Abstractions for external communications (Supabase, AI module).
- `/config`: Centralized configuration and environment variable validation.
