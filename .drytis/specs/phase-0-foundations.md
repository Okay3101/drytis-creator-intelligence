# Spec · Phase 0 — Foundations

## Goal
Project skeleton, auth, design system, and API shell so every later feature lands in a working app.

## Work
1. Laravel 12 API in `/workspace/backend`: models + migrations per `.drytis/schema.md`, Sanctum auth, role middleware (creator|brand|admin), policy-based data isolation.
2. Auth flows: register (account type selection), email verification + OTP, login, forgot/reset password, sessions, logout, account deletion (cascading cleanup job: tokens, IG connections, analyses, uploads, automations; legal/financial records retained via `retained_records` flag).
3. React 18 + Vite + TS SPA in `/workspace/frontend`: router (creator nav Home|Diagnose|Trends|Create|Analytics|Marketplace; brand nav; role-gated routes), API client, auth context.
4. Design system: tokens (color, typography, spacing), components — Card (layered, soft shadow), TactileButton, Field, Toggle, Tabs, Sheet/Modal, Skeleton (loading), EmptyState, ErrorState, Toast. Premium tactile aesthetic, Hinglish-safe text expansion, mobile-first.
5. Admin SPA shell at `/admin` (login-gated, separate nav tree).
6. Caddy: SPA at `/`, API at `/api`, admin at `/admin`. Services: `queue-worker`, `scheduler`.
7. Notification infrastructure: in-app notification center + push token registration; notification service used by all later phases.
8. Support chat (in-app, separate from campaign chat): user conversations + admin support inbox.
9. Platform settings table + audited `SettingsService`; seed defaults (automation allowance, plan limits, thresholds).

## Acceptance Criteria (running app)
- [ ] A new user can sign up choosing Creator or Brand, verify email+OTP, log in, log out, and delete their account; after deletion their data connections are gone.
- [ ] Password reset via OTP/email works end-to-end.
- [ ] Creator sees the 6-item nav; brand sees its own nav; routes are role-gated (a creator cannot open brand routes).
- [ ] Site is usable and polished on a phone-width viewport and on desktop.
- [ ] Every screen shows proper loading/empty/error states (no blank screens).
- [ ] A user can open Support chat and send a message; an admin can see and reply.
- [ ] Notification center shows an in-app notification when triggered.

## Edge cases
OTP expiry/resend limits; deleted account with active subscription flagged for admin; disabled account login message; token refresh failure states.
