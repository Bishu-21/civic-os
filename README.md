# 🏛️ CivicOS: AI-Powered National Grievance Redressal

**CivicOS** is a state-of-the-art, high-fidelity platform designed for the **Government of India (National Scope)**. It leverages advanced Artificial Intelligence and Spatial Intelligence to revolutionize how citizens report, track, and verify municipal grievances, bridging the gap between urban residents and local administration.

![CivicOS Dashboard](https://raw.githubusercontent.com/Bishu-21/civic-os/main/citizen_portal_home_design.png)

---

## 🌟 Highlights
- **🚀 One-Touch Reporting**: Rapidly submit grievances with AI-refined descriptions and photo evidence.
- **🤖 Gemini AI Intelligence**: Automated categorization, translation, and sanitization of multi-lingual reports.
- **🎙️ Voice-First Accessibility**: Report issues via natural voice commands powered by Sarvam AI.
- **📍 Spatial Command Center**: Real-time interactive mapping for city-wide grievance visualization.
- **🛡️ Secure & Compliant**: Built with Row-Level Security (RLS) and DPDP 2023 data privacy standards.
- **📱 Fully Responsive**: A premium, "alive" interface that adapts perfectly from mobile to desktop.

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Key Features](#-key-features)
4. [Getting Started](#-getting-started)
5. [Usage](#-usage)
6. [Security & Sanitization](#-security--sanitization)
7. [Contributing](#-contributing)
8. [License](#-license)

---

## ℹ️ Overview
CivicOS solves the fragmented nature of urban grievance management. By transitioning from regional silos to a unified national architecture, it ensures that every streetlight, pothole, or waste issue is documented with geometric precision and resolved with administrative accountability.

The platform is designed to handle the scale and diversity of India, featuring multi-lingual support and low-bandwidth optimizations to serve every citizen, everywhere.

---

## 🛠️ Tech Stack
| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, React 19, Turbopack |
| **Backend** | [Appwrite](https://appwrite.io/) | Auth, Realtime DB, Blob Storage, RLS |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Fluid Design, Glassmorphism, Premium UI |
| **AI (Cognitive)** | [Google Gemini](https://ai.google.dev/) | Multi-lingual analysis & description cleanup |
| **AI (Voice)** | [Sarvam AI](https://sarvam.ai/) | Vernacular Voice-to-Text & TTS Assistance |
| **Mapping** | [Leaflet](https://leafletjs.org/) | Interactive Global Spatial Interface |
| **Geocoding** | [Geoapify](https://www.geoapify.com/) | Reverse geocoding for precise addressing |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) | Distributed rate limiting & security protection |

---

## 🚀 Key Features

### 1. Intelligent Grievance Refinement
Citizens can report in their local dialect (Hindi, Bengali, etc.). Our integrated **Gemini AI** automatically translates, summarizes, and cleans up the description into professional administrative English.

### 2. Physical & Spatial Mapping
Every report is geocoded using **Geoapify** and placed on a **Leaflet** map. This allows administrators to see "hotspots" of reported issues and allocate resources where they are needed most.

### 3. Voice Assist & Accessibility
Designed for inclusivity, CivicOS features a voice-to-text reporting system. Citizens who find typing difficult can simply speak their issue, and the system handles the rest.

### 4. Real-Time Tracking Dashboard
A centralized command center for citizens to track their ticket status from "Reported" to "Resolved" with real-time notifications.

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: 20.x or higher
- **Appwrite Cloud**: A project configured with Databases and Storage Buckets.
- **Upstash Redis**: For rate limiting.
- **API Keys**: Gemini, Geoapify, and Sarvam AI.

### ⬇️ Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bishu-21/civic-os.git
   cd civic-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Appwrite
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_id
   DATABASE_ID=your_id
   PROFILES_COLLECTION_ID=your_id
   
   # AI & Maps
   GEMINI_API_KEY=your_key
   GEOAPIFY_API_KEY=your_key
   SARVAM_API_KEY=your_key
   
   # Rate Limiting (Upstash)
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🛡️ Security & Sanitization
CivicOS implements a **"Zero-Trust"** security model:
- **Row-Level Security (RLS)**: Citizens can only modify or delete their own data.
- **Input Sanitization**: XSS and Injection protection on every text input field.
- **Rate Limiting**: Protection against brute-force and bot exhausted resources via Upstash Redis.
- **Prompt Shielding**: Isolated AI processing blocks to prevent prompt injection attacks.

---

## 🧪 Tests
To run the automated security and integration test suite:
```bash
npm test
```

---

## 🤝 Contributing
We welcome contributions to make CivicOS better! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## ✍️ Authors & Acknowledgments
- **Bishal Sarkar** - Lead Architect & Developer
- Developed for the **National Civic Innovation Challenge**.
- Inspiration from the digital governance initiatives of the **Government of India**.

---
**Project Status**: Active Development 🚀
