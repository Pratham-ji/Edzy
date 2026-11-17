# Edzy AR Sync Engine (`packages/ar-sync-engine`)
> **Pod Lead**: Teammate 2 (Spatial Computing & AR Synchronization)

## 🥽 Mission & Scope
The **AR Sync Engine** provides the communication, transformation, and state synchronization contracts between the **Smart Board (Web ERP)** and the **Student's Mobile Device (React Native Expo App)**.

It ensures that when a teacher rotates a 3D human heart, explodes an internal combustion engine, or steps through chemical electrolysis on a classroom smart-board or projector, every connected student's mobile device renders the exact 16:9 spatial orientation in real time with sub-100ms latency.

---

## 📡 Core Protocol Specifications

### 1. 16:9 Viewport Normalization
Smart classroom projectors and IFPs (Interactive Flat Panels) operate in 16:9 aspect ratios. Student phones may have varying aspect ratios (19.5:9, 20:9). The sync engine normalizes all spatial coordinates to a canonical `[-1.0, 1.0]` coordinate space anchored to a standard 16:9 frustum.

### 2. Transport Layer
* **WebRTC DataChannels** for ultra-low latency peer-to-peer telemetry (rotation quaternion, zoom, camera orbit).
* **Supabase Realtime Broadcast Channels** (`room:school_id:class_section_id:ar_session`) for reliable fallback and session join states.

### 3. Directive Types
* `MODEL_LOAD`: Loads a specific GLTF/USDZ asset from Edzy's NCERT 3D asset library.
* `TRANSFORM_SYNC`: Live Quaternion rotation and camera matrix synchronization.
* `PART_HIGHLIGHT`: Highlights a specific sub-mesh (e.g., "Left Ventricle", "Mitochondria").
* `EXPLODE_VIEW`: Adjusts the radial explosion slider (0% to 100%).
* `AI_ASSISTANT_PIN`: Projects an AI explanatory tooltip at 3D coordinate `(x, y, z)`.

---

## 📦 Exported Types & Contracts
See [types.ts](file:///Users/pratham/Projects/Edzy/packages/ar-sync-engine/src/types.ts) and [index.ts](file:///Users/pratham/Projects/Edzy/packages/ar-sync-engine/src/index.ts) for full TypeScript interfaces.
