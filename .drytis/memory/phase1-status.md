# Phase 1 — Instagram + intelligence core (DONE, in review)

## What works (verified)
- Demo connect: POST /api/instagram/connect-demo {username} → creates account, dispatches SyncAndAnalyzeAccount → queue-worker runs pipeline → Diagnosis + WinningPatterns persisted → notification. Verified: 19 reels, health 85, patterns with evidence.
- Multi-account: each account has own diagnosis/patterns (switcher in UI).
- Minimum-5 gate: <5 reels → analysis completed with results.blocked=minimum_reels + message; verified with stub provider (3 reels). NOTE: gate is bypassed if demo provider re-pulls — verify gate via stub, demo always returns ≥12 reels.
- ContentAnalyzer heuristics: qualitative labels (critical/needswork/average), Top-3 Fix First with Problem/Evidence/Fix, Content Health 0–100 (weighted formula), Winning Patterns with evidence counts, confidence low/moderate/high. 4 unit tests pass (tests/Unit/ContentAnalyzerTest.php).
- Endpoints: /api/instagram/accounts, connect, connect-demo, callback, accounts/{id}/sync (5-min rate limit), analysis-status, diagnosis, feedback; /api/home/priority (dynamic Today's Priority from top problem).
- UI: Diagnose page (content health ring, fix-first cards, strengths, winning patterns, yes/no feedback, sync button, demo connect), wired into SPA.

## Gotchas
- Provider binding: use app(InstagramProvider::class) — interface bound in AppServiceProvider by config('instagram.mode'). Static provider() must go through the container (was resolving GraphApiClient directly in jobs and crashing).
- Content model updateOrCreate keyed on [instagram_account_id, ig_media_id] — idempotent sync.
- InstagramAccount has NO SoftDeletes trait (don't call withTrashed).
- queue-worker needs restart after changing provider binding (old container cached in worker).
- Carbon/`?->` on Eloquent results in tinker one-liners can silently return null.
