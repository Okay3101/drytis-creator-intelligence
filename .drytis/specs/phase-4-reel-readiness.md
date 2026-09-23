# Phase 4 — Reel Readiness Mobile Flow

## Goal
Mobile-native upload → readiness score → fix → re-upload loop. Backend routes already exist (`/api/readiness*`: upload, submit, history, show); no backend logic changes.

## Upload experience
- Large tactile **Upload Reel** card (camera roll / video picker / file picker via native inputs, `accept="video/*"` `capture` where supported). Upload shows progress state.
- Optional expandable sections (bottom sheets or accordions — none required): Caption, Cover, Hashtags, Location, Audio, Audience, Objectives.
- History list of past readiness checks (`/api/readiness/history`) as compact cards.

## Result screen
- Central big **ScoreDial** `8.2 / 10` + verdict chip ("Almost Ready" amber, Ready green, etc. — color + icon + text).
- **Strengths** list (✓ items) and **Needs Attention** list (⚠ items) as stacked cards.
- Primary button **Fix & Re-check** → returns to upload with context kept (previous version shown as reference).
- **Upload Improved Version** → quick re-upload → **Check Again** → new result, with version comparison (score delta vs previous check) shown.

## Acceptance criteria
- [ ] Creator can pick a video from device, upload, submit, and receive a readiness result
- [ ] Optional fields expand/collapse and are never required
- [ ] Result shows dial, verdict, strengths ✓ and needs-attention ⚠
- [ ] Fix & Re-check → upload improved version → new score; delta vs previous score visible
- [ ] History lists prior checks; tapping opens that result
- [ ] Flow works one-handed; no horizontal overflow at 360–412px
