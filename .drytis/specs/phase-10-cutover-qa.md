# Phase 10 — Cutover, Safe-Area/Device QA & Admin Verification

## Cutover
- Serve the new mobile SPA at `/` (creator/brand app), keeping `/admin` untouched. Old bundle remains at a legacy path initially for rollback.
- Update `routes/web.php` catch-alls accordingly; rebuild assets; verify preview URL.

## Device & viewport QA (per testing spec)
- Viewports: 360px (small Android), 375 (iPhone SE-class), 390 (iPhone 14/15), 412 (Pixel-class).
- Verify: navigation, scrolling, forms + keyboard behavior (inputs scroll into view, sheets dismiss on keyboard), uploads, bottom sheets, touch controls, safe areas (notch/Dynamic Island/home indicator via safe-area insets), notifications, video preview, charts, marketplace application, automation setup.
- Zero horizontal overflow anywhere; all primary controls reachable thumb-zone.

## Functional regression
- Login/register/OTP as creator + brand; diagnose; readiness; trends; create/revise; analytics; marketplace apply + workspace; automation toggle + usage; subscription + coupon; notifications; profile; settings; delete account.
- Admin Center (`/admin`, admin login, dashboard/users/coupons/settings/support/reports) fully unchanged and working.

## Acceptance criteria
- [ ] New app served at `/` on preview URL; `/admin` unchanged and functional
- [ ] All viewports listed render without horizontal overflow
- [ ] Full creator journey passes: register → connect → diagnose → fix → readiness → create script → apply to campaign → set automation
- [ ] Existing APIs, AI, Instagram integration, auth, billing all behave as before
- [ ] Important controls never sit under system UI on notched devices
