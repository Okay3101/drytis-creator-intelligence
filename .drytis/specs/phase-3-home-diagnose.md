# Phase 3 — Home & Diagnose (mobile-native)

## Goal
Rebuild Home as a mobile action dashboard and Diagnose as the mobile diagnostic hub.

## Home (`GET /api/home/priority`)
- Greeting header (time-of-day + name) at top.
- **Today's Priority** card: problem title, short explanation, primary `Fix This` button (tactile) → deep-links into Diagnose detail.
- Quick actions row: Diagnose · Create · Trends · Analytics (4 tactile shortcut tiles).
- **Progress** component (NOT the 0–100 score): "Content improvement" checklist with ✓ done / → pending items (e.g. Visual Hook ✓, Audio ✓, Verbal Hook →, CTA →) using a tactile progress list. Content Health score stays out of Home.
- Instagram connect/diagnose CTA when no account connected.

## Diagnose (`/api/instagram/*`: accounts, connect-demo, sync, diagnosis, feedback)
- Two large tactile cards at top: **Existing Content Diagnosis** ("Find what's holding your content back") and **Reel Readiness** ("Check your Reel before publishing").
- Account switcher + sync button (5-min ratelimit respected, show inline status).
- Diagnosis screen: big **ScoreDial** `68 / 100` (only place besides Reel Readiness), then "We found N areas to improve" → stacked cards per area: name + severity chip (Critical=red / Needs Work=amber / Strong=green, with icon not color alone), one-line explanation, `Fix →` button. Priority first, supporting info collapsed, no 15-metric wall.
- Minimum-5-reels gate rendered as a friendly blocked card.
- Winning Patterns: swipeable horizontal card carousel ("Your Winning Pattern", Problem→Solution, evidence line "Found across 4 of your stronger Reels"), `Explore Pattern` opens bottom sheet. No analytical table.
- Thumbs-up/down feedback per diagnosis item (`/api/instagram/{id}/feedback`).

## Acceptance criteria
- [ ] Home shows greeting, priority card with working Fix This deep link, 4 quick actions, progress checklist — no 0–100 score
- [ ] Diagnose shows the two large cards; both flows work
- [ ] Content Health dial animates its reveal once
- [ ] Improvement areas render as stacked cards with severity chips + Fix buttons
- [ ] Winning patterns swipe horizontally on touch
- [ ] Blocked state (fewer than 5 reels) is clear and friendly
- [ ] All above at 360–412px with no horizontal scroll
