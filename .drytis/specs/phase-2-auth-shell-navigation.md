# Phase 2 — Auth, Shell & Navigation

## Goal
Login/register + app shell with tactile bottom tab bar. All screens listed in the existing bundle routes must be reachable.

## Screens
- `/m/auth` — login/register toggle, creator|brand account-type picker, OTP verify + resend, forgot/reset password. Same endpoints: `POST /api/auth/register|login|verify-otp|resend-otp|forgot-password|reset-password`, token stored as `auth_token`.
- App shell: bottom tab bar **Home | Diagnose | Trends | Create | More** (5 tabs on small phones). "More" opens a bottom sheet with Analytics, Marketplace, Automation, Notifications, Support, Profile, Settings — ALL six primary sections reachable (Analytics + Marketplace also promoted into More prominently). Selected tab gets elevated tactile state, icon + label, strong contrast. Bar respects bottom safe-area inset.
- Role handling: brand accounts see brand nav (Home, My Campaigns, Analytics, Notifications, Settings) — same routes/endpoints as before.
- Protected routes redirect to `/m/auth` when no/invalid token; `GET /api/auth/me` on boot.
- Pull-to-refresh gesture on top-level screens.

## Acceptance criteria
- [ ] Creator can register → verify OTP → land on Home; token persists across reload
- [ ] Brand account sees brand nav, creator sees creator nav
- [ ] Bottom nav: 5 tabs on 360px width, no crowding/overflow; all six primary sections reachable within 2 taps
- [ ] Logged-out user visiting any screen is redirected to auth
- [ ] No horizontal overflow at 360/375/390/412px
