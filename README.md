# Edzy 🚀
### Next-Gen B2B K-12 Educational SaaS & Spatial Computing Platform for Indian Schools

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK-black?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20Postgres-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Styling-NativeWind%20%2F%20TailwindCSS-38bdf8?logo=tailwindcss)

Edzy is an enterprise-grade school operating system and immersive spatial learning ecosystem designed specifically for the Indian K-12 landscape (CBSE, ICSE, and State Boards). It bridges the gap between conventional school management (ERP, fees, attendance, report cards) and futuristic 3D/AR spatial classrooms with on-device syllabus AI tutoring.

---

## 🏗️ Architecture & Monorepo Overview

This monorepo is structured for modular velocity, strict team separation of concerns, and zero merge conflicts across three core development pods:

```text
/
├── apps/
│   ├── mobile-app/          # 📱 Edzy Unified Student & Parent App (Expo Router + NativeWind + Zustand)
│   └── web-admin/           # 💻 School Command Web ERP (Principal, Teacher & Admin Dashboard)
├── packages/
│   ├── ar-sync-engine/      # 🥽 Teammate 2: 16:9 AR Projection + WebRTC Sync + AI Spatial Directives
│   └── rag-pipeline/        # 🧠 Teammate 3: Class-wise Syllabus RAG Engine (CBSE/ICSE NCERT Embeddings)
├── supabase/
│   └── migrations/          # 🗄️ Multi-tenant Postgres schemas, RLS policies, spatial logs & ERP tables
└── README.md                # 📖 System Architecture & Engineering Handbook
```

---

## 👥 Pod Ownership & Teammate Contracts

| Teammate | Focus Area | Directory | Primary Stack |
| :--- | :--- | :--- | :--- |
| **Teammate 1 (Lead)** | Mobile & Full-Stack Core | `apps/mobile-app`, `supabase/` | Expo Router, React Native, NativeWind, Zustand, Supabase Auth/DB |
| **Teammate 2** | Spatial Computing & AR Sync | `packages/ar-sync-engine` | 16:9 AR Viewport, WebRTC DataChannels, Spatial Directives, 3D Mesh Telemetry |
| **Teammate 3** | AI Syllabus RAG & Intelligence | `packages/rag-pipeline` | CBSE/ICSE Vector Embeddings, pgvector, LangChain/LlamaIndex, Multilingual Hindi-English NLP |

---

## 🌟 Key Platform Capabilities

### 1. Unified Mobile App (`apps/mobile-app`)
* **Dual Persona Switcher**: Instant switching between **Student Learning Mode** (gamified streaks, AR viewer, timetable, AI doubts) and **Parent Guardian Mode** (attendance alerts, live bus tracking, fee payments, report cards).
* **16:9 AR Spatial Classroom Companion**: Interactive 3D model inspector for Science, Biology, Chemistry & Physics with synchronized classroom directives broadcast by teachers on smart boards.
* **Syllabus AI Doubt Solver**: Board-tailored AI tutor answering curriculum doubts with step-by-step reasoning and Hinglish voice/text support.
* **Indian Fee Stack**: Integrated UPI (PhonePe, GPay, Paytm) mock-ready payment gateway, installment schedules, and GST-compliant digital receipt generator.
* **Offline-Resilient Architecture**: Zustand stores with optimistic local caching and seamless Supabase real-time sync.

### 2. School Command Web ERP (`apps/web-admin`)
* Multi-tenant tenant resolution (`school_id`).
* Class, section, and timetable scheduling.
* CBSE/ICSE compliant automated report card generation.
* Teacher AR lesson broadcaster & classroom tablet control.

### 3. AR Sync Engine (`packages/ar-sync-engine`)
* Peer-to-peer WebRTC signaling and low-latency broadcast for smart-board to student device 16:9 projection.
* Protocol definitions for model transformations, explosion views, annotations, and spatial telemetry.

### 4. Syllabus RAG Engine (`packages/rag-pipeline`)
* Vector retrieval engine indexed across NCERT textbooks (Grades 6–12).
* Hybrid lexical + semantic search with grade-appropriate response synthesis.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (Tested on Node v25)
* **npm** or **pnpm**
* **Expo Go** app on iOS / Android or iOS Simulator / Android Emulator

### Installation & Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/Pratham-ji/Edzy.git
   cd Edzy
   ```

2. **Run Mobile App:**
   ```bash
   cd apps/mobile-app
   npm install
   npx expo start
   ```

3. **Supabase Environment Variables:**
   Copy `.env.example` in `apps/mobile-app/.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(The mobile app includes an automatic offline demo fallback when Supabase keys are not set, allowing instant evaluation).*

---

## 🔐 Security & Multi-Tenancy

Every database query in Edzy enforces PostgreSQL **Row Level Security (RLS)** strictly scoped by `school_id`, `student_id`, and `parent_id`. Data cannot leak across different schools or non-associated guardian accounts.
