# Phase 5 — Trends & Create (script studio)

## Trends
- Vertical stack of trend cards (feed-style): emoji + title, chips (region / niche / language), "Why it matters" one-liner, status chip (Emerging/Rising/Saturated/Declining), saturation indicator (dots or bar), tactile **Use This Trend** button.
- Tap card → **bottom sheet detail**: trend name, why trending, momentum, saturation, niche relevance, language relevance, example structure, how to adapt. `Use This Trend` → Create with trend preloaded.
- Data from existing trends endpoints; no backend logic changes.

## Create — idea capture
- Big headline **"What's your idea?"**, large tactile input card, prominent mic (voice) button using the browser SpeechRecognition API with graceful fallback when unsupported.
- **AI Intelligence controls**: three tactile toggles before generation — My Winning Patterns / Competitor Insights / Current Trends — persisted per user where backend supports it.

## Script editor
- Generated script shown as collapsible sections: Hook · What to Say · What to Show · On-Screen Text · Timing · CTA. Never a wall of text.
- Primary **Revise** button opens bottom sheet with quick actions: Stronger Hook, More Natural Hinglish, Funnier, Shorter, More Controversial, Change CTA, Rewrite Body, Easier to Speak + free-text custom input → calls existing `POST /api/scripts/{id}/revise`; revised script replaces view with a subtle transition, previous versions browsable from script history (`/api/scripts/history`, `/api/scripts/{id}`).
- Save/copy actions; scripts history list.

## Acceptance criteria
- [ ] Trends feed renders stacked cards with status + saturation; Use This Trend opens Create with trend applied
- [ ] Trend detail opens as bottom sheet with all 8 listed fields
- [ ] Creator can type or dictate an idea and generate a script
- [ ] Three intelligence toggles render and affect the generate call
- [ ] Script shows as 6 collapsible sections
- [ ] Revise sheet offers the 8 quick actions + custom input; revision updates the script in place
- [ ] Works at 360–412px, keyboard doesn't cover the idea input
