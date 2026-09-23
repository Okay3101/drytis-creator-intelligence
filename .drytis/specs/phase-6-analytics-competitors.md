# Phase 6 — Analytics & Competitor Intelligence (mobile)

## Analytics (`GET /api/analytics/overview`)
- Vertical scroll, never a desktop dashboard grid:
  1. Summary cards row (2×2 or swipeable): Followers, Engagement, Views, Reach — big tactile metric cards.
  2. **Performance Trend**: mobile-friendly chart (lightweight SVG/Canvas, lazy-rendered on scroll).
  3. **Top Content**: vertically stacked Reel cards (thumb, title, key metric).
  4. **Audience**: compact cards/charts.
- Sections lazy-load; charts sized for 360px width.

## Competitor section (within Analytics)
- Max **3 competitor cards**: profile row (avatar, name, handle), top content, patterns, gaps.
- Where Instagram/Meta permits, embedded Reel previews in the card; otherwise permitted metadata + link-out. Never re-host unauthorized content.
- **Gap analysis** flow as a simple vertical chain: Competitor Pattern ↓ Your Current Pattern ↓ Your Gap, then `Review Pattern` bottom sheet → `Use in Create` (deep link into Create, e.g. prefilled idea).
- Data from existing Competitor* models/APIs as available; if a competitor endpoint needs exposing, add a read-only API route — no logic changes.

## Acceptance criteria
- [ ] Analytics shows the 4 summary metric cards, trend chart, top-content stack, audience cards — all vertically scrolling, no desktop grid
- [ ] Charts fit 360px and load lazily
- [ ] Competitor list caps at 3 cards with profile + top content + patterns + gaps
- [ ] Gap analysis renders as the 3-step vertical chain with Review Pattern → Use in Create working end-to-end
- [ ] Reel previews only via embed/permitted metadata — no re-hosted files
