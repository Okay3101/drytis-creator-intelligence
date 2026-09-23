# Spec · Phase 3 — Competitor Intelligence + Trends

## Goal
Manual competitor intelligence (max 3) and personalized trend intelligence, both feeding Create.

## Work
1. Competitors: creator manually adds up to 3 (hard cap enforced); per-competitor analysis (queued) of publicly/permitted content: Top 5 performing, why it worked, recurring patterns, creator content gaps (competitor pattern vs creator's current pattern vs untested opportunity). Latest-only storage (no history timeline).
2. Refresh: Quick Refresh (new reels, top 5, patterns, gaps) and Full Analysis (rebuild all); "Last Analyzed" shown.
3. Display: embed/preview + permalink where permitted; graceful metadata/link fallback when embedding unavailable. Never download/re-host.
4. Pattern workflow: "Create Content Using This Pattern" → Pattern Details screen (pattern, why it matters, source, evidence, difference from creator's content) → Edit Pattern → "Use in Script Generator" (pre-fills Create). Never copies competitor wording/assets.
5. Trends engine: aggregated legitimate sources (configurable in Admin); types: audio, topics, formats, structures, hooks, hashtags, search terms; ranking combining popularity, momentum, niche/audience/language/style relevance, India priority, saturation; states Trending/Emerging/Saturated/Declining (+historical context); personalized per creator account.
6. Trends UI: filters by state/type; each trend shows what/why/momentum/saturation/relevance and "Use This Trend" → Script Generator pre-filled. Empty state "We're checking for relevant trends."

## Acceptance Criteria
- [ ] Creator adds competitors one at a time; adding a 4th is blocked with explanation; each competitor shows Top 5, patterns, gaps, and Last Analyzed.
- [ ] Quick Refresh updates incrementally; Full Analysis rebuilds everything; only latest analysis retained.
- [ ] "Create Content Using This Pattern" opens Pattern Details first, allows editing, then pre-fills the script generator — no direct script generation.
- [ ] Competitor content shows as permitted embed/preview or link fallback; nothing is re-hosted.
- [ ] Trends list is personalized (changes with account/niche/language) and each trend carries a state badge with momentum/saturation context.
- [ ] "Use This Trend" opens the script generator with the trend pre-filled.

## Edge cases
Competitor account private/invalid; embed unavailable; trend source failure; no trends yet; competitor analysis job failure retry.
