# Phase 8 — Automation Control Center, Subscriptions & Coupons

## Automation screen
- Mobile control center look: automation cards, e.g. **Comment Automation** with big tactile ON/OFF toggle, Post selector (choose from user's Reels, e.g. "My latest Reel"), Trigger display ("New Comment").
- **Require Follow** — prominent dedicated toggle near the top, with one-line explainer: "Only qualifying followers can trigger this automation when enabled, subject to Instagram/Meta rules." Not buried in advanced settings.
- Response message editor.
- **Usage**: tactile progress card — "17 / 25 free interactions used" with progress bar + "8 free interactions remaining" line, per-post view.
- Backend note: automation API routes missing in `routes/api.php` though models exist — expose routes reusing existing controllers; no logic changes.

## Subscription plans
- Tactile selection cards: Starter (1,000 interactions/mo) · Pro (5,000) · Unlimited. Prices **from backend/Admin** (`Plan` model) — never hard-coded. Current plan highlighted; upgrade/downgrade flow via existing subscription logic.

## Checkout + coupons
- Checkout screen with plan summary and **"Have a coupon?"** expandable: code input + Apply. Successful discount shown clearly (old price struck, new price, savings line). Existing billing/coupon logic unchanged.

## Acceptance criteria
- [ ] Automation card toggles on/off; Require Follow is prominent with its explainer
- [ ] Usage card shows used/total with progress bar and remaining count
- [ ] Plan cards render backend-provided pricing; selecting a plan starts checkout
- [ ] Coupon apply shows the discount clearly; invalid code shows an error
- [ ] No horizontal overflow at 360–412px
