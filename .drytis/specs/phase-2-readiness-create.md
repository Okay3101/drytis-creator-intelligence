# Spec · Phase 2 — Reel Readiness + Create (Script Generator)

## Goal
Pre-publish Reel Readiness workflow with fix loop, and the creator-specific AI Script Generator with intelligence toggles and revisions.

## Work
1. Reel Readiness: upload video + optional caption/cover/hashtags/audio/objectives; secure validated uploads (format/size checks, retention deletion policy); queued analysis → score 1–10 + label (e.g. "8.2 / 10 Almost Ready"), Strengths + Needs Attention lists. NO predictions of views/followers/virality/performance anywhere.
2. Fix loop: after diagnosis, "Fix" returns creator to upload page with problems surfaced; re-upload re-checks readiness; loop repeats. Ends at readiness — no post-publish prediction loop.
3. Analytics engine (backend): followers, growth, views, reach, engagement, per-Reel performance, categories, top/underperforming, audience insights — from legitimately available insights. Analytics UI ("what happened") clearly separate from Diagnose.
4. Script Generator: idea input (text + voice input via browser speech recognition), optional advanced fields, inferred defaults from creator intelligence; three independent toggles (Winning Patterns / Competitor Insights / Current Trends) — never auto-enabled; objectives as context; output ONE production-ready script (Hook→Visual→Audio→Body→Pacing→On-Screen Text→CTA + caption/hashtag guidance, approximate timings) plus Voiceover-Only mode; style from detected creator style (overridable).
5. Revision flow: "Revise Script" instructions (stronger hook, more natural Hinglish, shorter, change only CTA, keep hook rewrite body…); revisions preserve unchanged parts; revision history stored.

## Acceptance Criteria
- [ ] Creator uploads a reel with metadata and receives a 1–10 readiness score with strengths and needs-attention items; no predicted-performance text appears anywhere.
- [ ] Fix → re-upload → re-check loop completes; each attempt is stored.
- [ ] Unsupported/oversized files are rejected with a clear message; analyzed media is cleaned per retention policy.
- [ ] Analytics dashboard shows real (or clearly demo-labeled) account metrics with charts, top/underperforming content, and category breakdown.
- [ ] Script generator produces one structured production-ready script; toggles change the output context; disabled toggles demonstrably don't inject that intelligence.
- [ ] Voiceover-only mode returns spoken content only.
- [ ] Revise ("make the hook stronger, keep the rest") changes the hook while visibly preserving other sections; full revision history exists.
- [ ] Voice input works in supported browsers with a graceful fallback.

## Edge cases
Upload failure/resume; long video caps; AI job failure retry; empty intelligence (no diagnosis yet) — generator still works with reduced context and says so.
