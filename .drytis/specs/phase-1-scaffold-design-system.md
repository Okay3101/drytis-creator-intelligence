# Phase 1 — Mobile App Scaffold & Tactile Design System

## Goal
Create `frontend-mobile/` — a fresh Vite + React 19 + TypeScript SPA that becomes the new creator/brand mobile app, served alongside the existing apps without touching the Laravel backend or Admin SPA.

## Setup
- New Vite React-TS app at `/workspace/frontend-mobile/`, build output copied to `public/m/` (route `/m/{any}` served by a catch-all in `routes/web.php` mirroring the existing SPA serving).
- Existing `public/index.html` creator SPA stays reachable until cutover; final cutover later serves the mobile app at `/`.
- Caddy/php serving stays as-is (Laravel serves the static build). Register a background service for the Vite dev build only if needed; production uses built assets.
- Fetch wrapper: same contract as before — base `/api`, `Authorization: Bearer <token>` from `localStorage.auth_token`, throws `ApiError {status, message, errors}`.

## Design system (`src/design/`)
- Lift and extend tokens from `public/assets/index-BJkOFmrd.css`: `--bg:#0d0f14`, `--surface` shades, `--accent:#7c5cff`, `--success:#3ddc97`, `--warning:#ffb454`, `--danger:#ff6b7a`, `--info:#4cc9f0`, Inter font, radii/shadow/transition vars, dark-first + `[data-theme=light]`.
- Tactile component library (CSS-only where possible, used selectively):
  - `TactileButton` (raised surface, pressed = scale .97 + shadow reduction)
  - `TactileCard` (layered depth, optional interactive press state)
  - `TactileToggle` (physical-feeling switch)
  - `TactileProgress` (layered track + animated fill)
  - `ScoreDial` (animated reveal dial, used ONLY for Content Health / Reel Readiness)
  - `BottomSheet` (mobile modal sheet, drag-to-dismiss)
  - `Segmented`, `EmptyState`, `Skeleton` loaders
- Safe areas: `env(safe-area-inset-*)` padding on shell + bottom nav; `viewport-fit=cover` meta.
- Content column `max-width:680px`, no hover-dependent interaction (use `:active`), touch targets ≥ 44px.

## Acceptance criteria
- [ ] App loads at `/m/` in a browser; bottom placeholder shell renders on 360–412px viewports with no horizontal overflow
- [ ] TactileButton shows visible pressed state on touch
- [ ] Dark and light themes both render
- [ ] Existing creator SPA at `/` and Admin at `/admin` still work unchanged
