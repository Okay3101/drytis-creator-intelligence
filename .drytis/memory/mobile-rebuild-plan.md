# Mobile Rebuild Plan (Sept 2026)

Original frontend sources lost to fs corruption — only built bundles survive
(public/assets/index-B1Nm7yqX.js + index-BJkOFmrd.css). Rebuilding creator UX
from scratch in new `frontend-mobile/` (Vite + React 19 + TS), build → `public/m/`,
then cutover to `/`. Admin SPA at `/admin` untouched.

Key contract facts (keep consistent):
- API base `/api`, Bearer token in localStorage `auth_token`, ApiError {status,message,errors}.
- Auth: register (creator|brand) → OTP (verify-otp/resend-otp, 6min TTL) → login → Sanctum.
- Notifications: custom App\Models\Notification (not Laravel notifiable); /api/notifications, /notifications/read-all.
- Support: body + is_admin fields.
- Instagram sync 5-min ratelimit; min-5-reels gate for diagnosis.
- Readiness: /api/readiness (upload/submit/history/show). Scripts: /api/scripts (generate/{id}/revise/history/show).
- Admin: /api/admin/login, admin seed admin@drytis.dev.

Missing API routes (models exist) to expose WITHOUT logic changes:
- Creator automation (Automation* models, free 25 interactions/post concept)
- Campaign marketplace creator routes (Campaign* models) + workspace chat after approval
- Competitor read routes (Competitor* models)

Design tokens lifted from index-BJkOFmrd.css: dark-first (#0d0f14 bg, #7c5cff accent,
#3ddc97/#ffb454/#ff6b7a/#4cc9f0), Inter, mobile-first max-width 680px, bottom-nav pattern.

Specs at /workspace/.drytis/specs/phase-1..10-*.md. Modern subtle skeuomorphic mobile UI:
tactile buttons/cards/toggles, ScoreDial only for Content Health & Reel Readiness,
bottom tab bar Home|Diagnose|Trends|Create|More (More sheet: Analytics, Marketplace,
Automation, Notifications, Support, Profile, Settings).