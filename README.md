# CivicOS: AI-Powered Citizen Grievance System

**CivicOS** is a high-fidelity Minimum Viable Product (MVP) designed for the **Municipal Corporation of Delhi (MCD)**. It leverages AI and modern cloud infrastructure to revolutionize how citizens report, track, and verify civic grievances.

---

## 🏛️ Project Vision
CivicOS aims to bridge the gap between citizens and municipal authorities. By using AI-driven reporting and spatial mapping, it ensures that every streetlight, pothole, or waste issue is documented with precision and resolved with accountability.

## 🚀 Key Features

### 1. AI Quick-Report
- **Multi-Modal Input**: Report issues via text, voice, or image.
- **AI Analysis**: Powered by **Gemini 2.5 Flash Lite**, the system automatically categorizes issues (e.g., Sanitation, Electrical), estimates priority, and identifies the correct department.
- **Automated Routing**: Grievances are directed to the specific ward office based on geocoding.

### 2. Digital Identity & DPDP Compliance
- **Secure Authentication**: OTP-based mobile registration and login via **Appwrite**.
- **Privacy First**: Fully compliant with the **Digital Personal Data Protection (DPDP) Act, 2023**, ensuring citizen data is handled securely.
- **Government-Grade UI**: Designed following GIGW and WCAG 2.1 standards for accessibility.

### 3. Spatial Intelligence Map
- **Interactive Mapping**: Powered by **Leaflet & OpenStreetMap**.
- **Reverse Geocoding**: Automatically identifies the exact address and ward of a grievance using **Geoapify**.
- **Hotspot Visualization**: Administrators can see clusters of reported issues for better resource allocation.

### 4. Transparent Resolution
- **Track Status**: Real-time status updates from "Reported" to "Resolved".
- **Verification Workflow**: Citizens can verify the quality of work via the platform.

---

## 🛠️ Technology Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) | App Router, React, Turbopack |
| **Styling** | [TailwindCSS](https://tailwindcss.com/) | Responsive, Premium UI Design |
| **Backend** | [Appwrite](https://appwrite.io/) | Auth, Database, Storage, Sessions |
| **AI/ML** | [Google Gemini](https://ai.google.dev/) | Issue Analysis & Prioritization |
| **GEO** | [Geoapify](https://www.geoapify.com/) | Reverse Geocoding API |
| **Maps** | [Leaflet](https://leafletjs.org/) | Interactive Spatial Interface |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18.x or higher
- Appwrite Instance (Cloud or Self-Hosted)

### Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_db_id
NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTIONID=your_collection_id
GEMINI_API_KEY=your_gemini_key
GEOAPIFY_API_KEY=your_geoapify_key
```

### Installation
```bash
npm install
npm run dev
```

---

## 📅 Roadmap
- [x] OTP Authentication Flow
- [x] AI Issue Analysis
- [x] Spatial Map Integration
- [x] Mobile Responsiveness Overhaul (2026 Build)
- [ ] Blockchain-based verification ledger (Future)

---

## 📜 License
© 2026 Municipal Corporation of Delhi. All rights reserved.
Developed for the MCD Civic Innovation Challenge.
