# Edzy School Command Web ERP (`apps/web-admin`)

## 🏫 Overview
The **School Command Web ERP** is the administrative cockpit for Indian K-12 school leadership, educators, accountants, and IT administrators. It handles multi-tenant school governance, fee accounting, attendance auditing, and spatial AR classroom broadcasting.

## 🎯 Target Personas
1. **School Principal / Director**: High-level school KPIs, board exam pass percentages, fee collection analytics, staff attendance.
2. **Teachers & Subject Coordinators**: Timetable management, lesson planner, homework assignment, marks entry, and AR Spatial Lesson Broadcaster.
3. **Accounts & Admin**: Fee structure configuration (Tuition, Transport, Lab, Annual Charges), Challan & UPI payment verification, payroll.
4. **Transport Head**: School bus route allocation, GPS geo-fence tracking, driver assignment.

## 🛠️ Recommended Tech Stack
- **Framework**: Next.js 14+ (App Router, Server Actions)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Data Visualization**: Recharts / Tremor for academic performance and fee collection analytics
- **Spatial Classroom Controller**: WebRTC signaling interface to control the smart-board 16:9 projection in sync with `packages/ar-sync-engine`.

## 📁 Suggested Architecture
```text
apps/web-admin/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── analytics/          # Enrollment & Academic Trends
│   │   ├── students/           # Student Directory, KYC, Roll Nos
│   │   ├── classes/            # Class 1-12 & Section A/B/C Allocations
│   │   ├── attendance/         # RFID & Biometric Daily Audits
│   │   ├── fees/               # Dues, UPI logs, Defaulters List
│   │   ├── ar-control/         # Smart Classroom 16:9 Spatial Broadcaster
│   │   └── settings/           # School Profile & CBSE Affiliation Config
├── components/
├── lib/
│   └── supabase/
└── package.json
```
