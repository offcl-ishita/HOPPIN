# 🚀 HOPPIN — Live Campus Crowd Telemetry & Navigation

> **Stop walking into the crowd.** HOPPIN reads live hallway foot-traffic, elevator bottlenecks, and dining hall capacity across campus — automatically calculating clear alternate routes before you hit the delay.

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open **[http://localhost:5176](http://localhost:5176)** in your browser.

### 3. Build for Production
```bash
npm run build
```
The compiled, production-optimized assets will be generated in the `dist/` directory.

---

## 🏗️ Project Architecture & Components

- **`src/`**
  - **`components/Navbar.jsx`**: Floating glassmorphic pill navbar matching the deep obsidian aesthetic with responsive mobile drawer and tactile CTAs.
  - **`components/Footer.jsx`**: Multi-column authoritative footer with privacy badges and rollout status.
  - **`App.jsx`**: Complete application layout containing:
    - **Hero & Ambient Radar**: Live HUD preview card simulating class shift bypasses.
    - **Departure Telemetry Board**: Real-time crowd status, live search filter, capacity meters, and 1-tap pinning.
    - **2D Vector Cartography Simulator**: Interactive SVG map showcasing real-time obstacle avoidance.
    - **Semester ROI Productivity Calculator**: Real-time hours and steps saved estimator.
    - **Campus Priority Waitlist**: Verified `.edu` onboarding with instant shareable referral link generator.
    - **FAQ Accordion**: Interactive questions and answers.
  - **`assets/`**: High-resolution brand logo lockup (`hoppin_logo.png`) and standalone "H" glyph favicon (`hoppin_favicon.png`).
  - **`index.css` & `App.css`**: Design tokens, typography variables (Plus Jakarta Sans, Inter, JetBrains Mono), glassmorphism layers, and responsive grids.

---

## 🎨 Tech Stack
- **Framework**: React 19 / Vite
- **Typography**: Plus Jakarta Sans, Inter, JetBrains Mono
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (High-performance tokens & hardware-accelerated animations)

---

© 2026 HOPPIN Technologies Inc. · All rights reserved.
