# Spec · Phase 1 — Instagram Connection + Creator Intelligence Core

## Goal
Instagram OAuth (official Graph API only), multi-account support, content sync, initial analysis pipeline producing Diagnosis, Content Health, and Winning Patterns.

## Work
1. `InstagramOAuthService` + `InstagramClient`: professional-account-only OAuth, token encryption at rest, token health checks, refresh, clear failure UX. Credentials via env (documented placeholders; integration boundary mocked behind interface so flows run in demo mode without live Meta credentials, clearly labeled demo data).
2. Connect flow UI: connect → verify account type → reject non-professional with explanation → success. Multiple accounts; account switcher; fully separated data/intelligence per account.
3. Content sync job: pull permitted profile fields + Reels + insights; store in `contents` with data-coverage metadata (period, count, completeness).
4. Analysis pipeline (queued, status-tracked): ContentAnalyzer → niche/audience/style/language/category inference → per-category separation where sample size suffices → Diagnosis (qualitative labels Strong/Good/Average/Needs Work/Critical, no per-dimension numeric scores) → Top 3 "Fix First" + secondary observations, each with Problem/Evidence/Fix → Content Health 0–100 (shown only inside Diagnose) → Winning Patterns (normalized hybrid performance: follower growth > engagement > views; account-normalized) with evidence ("4 of your strongest Reels…").
5. Minimum-5-Reels gate with exact required empty state copy.
6. Diagnose UI: diagnosis view, Content Health, Winning Patterns ("Your Winning Patterns"), data availability banner, helpful Yes/No feedback, manual refresh + on-open staleness check (incremental analysis of new Reels).
7. Home: Today's Priority (dynamic from top problem; changes as problems improve), Progress (✓/→ problem checklist), quick actions.
8. Profile (basic), audience/style editable fields.

## Acceptance Criteria
- [ ] A creator connects a (demo or real) professional Instagram account; non-professional accounts are refused with a clear explanation.
- [ ] Multiple IG accounts appear in a switcher and show completely separate diagnoses/patterns.
- [ ] With <5 Reels the full diagnosis is blocked and the minimum-5 explanation shows; with ≥5 the full diagnosis runs asynchronously and completes with a notification.
- [ ] Diagnosis shows qualitative labels only (no per-dimension numeric scores), prioritized Top 3 problems with Problem/Evidence/Fix, strengths, and a Content Health 0–100 visible only inside Diagnose.
- [ ] Winning Patterns cite concrete evidence counts and never claim unsupported facts; weak evidence shows "Limited data available".
- [ ] Home's Today's Priority reflects the current top problem and updates when the top problem improves.
- [ ] Data-unavailable states show the data-coverage message instead of pretending analysis succeeded.
- [ ] Yes/No feedback records correctly.

## Edge cases
OAuth failure retry; token expiry mid-analysis; API partial data; duplicate sync idempotency; job failure with retry state.
