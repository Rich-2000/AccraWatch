# Accra Water Watch

A production-grade Vite + React + TypeScript + Tailwind CSS web app that lets people
compare **then vs now** satellite imagery of six flood-critical waterways in Accra,
Ghana: the Odaw River, Korle Lagoon, Chemu Lagoon, Densu River, Sakumono Lagoon,
and the Awoshie Lafa Stream.

Built in the context of the 29–30 June 2026 Accra/Tema floods, which the Ghana
Interior Ministry reported killed 12 people and affected over 38,800 residents.

## Features

- **Split-view comparison** — drag (or use arrow keys on) a slider to reveal the
  then/now satellite images, with year badges on each side.
- **Single-year view** — inspect just the "then" or "now" capture full-frame.
- **Change map** — a white sketch/outline overlay computed *live, on-device* from
  the real pixel differences between the two photos (canvas-based grayscale diff
  + edge detection). Not mocked, not pre-baked — every run reads the actual image
  data. Labelled clearly as an approximate visual change map, not a scientific
  land-cover survey, since capture angle/zoom vary slightly between years.
- **Zoom & pan** — mouse wheel / trackpad, pinch-to-zoom on touch, drag to pan,
  double-click to reset — works identically in every view mode.
- **Rectangular, distortion-free frame** — every river keeps its own fixed aspect
  ratio in both single and split views (object-fit: cover, never stretched).
- **Full dark/light theme** — persisted to `localStorage`, respects the system
  preference on first visit, toggle in the header.
- **Live flood-context banner and section** — real, sourced statistics from the
  June 2026 disaster (Reuters, Al Jazeera, GBC Ghana, UNDP Ghana).
- Fully responsive: phone, tablet, and desktop layouts; keyboard accessible;
  respects `prefers-reduced-motion`.

## Why no backend?

Every piece of data in this app — the twelve satellite photographs and their
metadata — is static. A FastAPI + MongoDB Atlas backend would add real
infrastructure (a live cluster, connection secrets, an API layer) with nothing
dynamic for it to serve yet. So this ships as a **frontend-only** app: simpler,
faster, and nothing to misconfigure or go down.

If you later want dynamic features — visitor-submitted imagery, saved
annotations, user accounts, an admin upload panel — that's a natural fit for a
FastAPI + MongoDB Atlas service, and the data layer here (`src/data/rivers.ts`)
is already shaped so it could be swapped for an API fetch with minimal changes.
Ask and I'll build that layer out.

## Getting started

```bash
npm install
npm run dev       # starts the dev server (default http://localhost:5173)
```

Build for production:

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  data/rivers.ts          River metadata: image paths, years, causes, flood context
  types/river.ts          Shared TypeScript types
  hooks/
    useTheme.ts           Dark/light theme state + persistence
    usePanZoom.ts         Wheel/drag/pinch zoom & pan
  utils/
    imageDiff.ts          Canvas-based real pixel-diff change map generator
  components/
    Header.tsx, ThemeToggle.tsx
    DisasterBanner.tsx, DisasterContextSection.tsx
    RiverSelector.tsx
    CompareViewer.tsx      Mode toolbar + zoom controls + frame
    ViewerFrame.tsx         Cartographic frame / scan-line decoration
    PanZoomStage.tsx
    SplitSlider.tsx, SingleView.tsx, ChangeOverlay.tsx
    YearBadge.tsx
    InfoPanel.tsx, Footer.tsx
public/images/            The 12 satellite photographs (then/now x 6 waterways)
```

## Data note on Sakumono Lagoon

The source imagery for Sakumono Lagoon originally had two files both labelled
"2003" (one with a filename typo). Per confirmation, the file `Sakumon lagoon
2003.jpg` is actually the **2024** capture; it has been renamed to
`sakumono-lagoon-now-2024.jpg` and the metadata corrected accordingly.

## Image credit

Satellite basemap imagery (c) Airbus / Maxar Technologies, as captured from
publicly available aerial map providers.
