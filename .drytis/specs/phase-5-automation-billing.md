# Spec · Phase 5 — Automation, Billing, Coupons

## Goal
Permitted engagement automation with follow-gating, free allowance, subscription plans, recurring billing, and an admin-configurable coupon system.

## Work
1. Automation builder: per post — trigger (comment/DM keywords), response message, Follow Requirement ON/OFF (enforced only where API/policy permits; otherwise explain limitation and disable gracefully). List/manage automations with status.
2. Usage metering: every qualifying interaction recorded (free/paid); per-post first 25 free (configurable in Admin); beyond allowance requires active paid plan, else automation pauses with clear creator messaging and notification.
3. Plans: seeded Free allowance / Tier 1 / Tier 2 / Tier 3-Unlimited — all prices & limits from `platform_settings`/plans table, Admin-editable. Nothing hard-coded.
4. Billing: payment gateway integration behind a clean `PaymentGateway` interface (Razorpay adapter for India; credentials via env, demo mode without keys, clearly labeled). Subscription lifecycle: create, renewal (scheduled job), upgrade/downgrade, cancel, payment failure → grace period → dunning states; usage tracking; invoice records retained for legal.
5. Coupons: Admin CRUD (code, type %/fixed/free-days/bonus-allowance, value, expiry, usage limit, per-user limit, eligible plans, start/end, active, creator-specific assignment, marketing campaign tag). Redeem at checkout; validation + redemption tracking.

## Acceptance Criteria
- [ ] Creator creates an automation with follow-gating ON/OFF; interactions are metered; after 25 free interactions on a post the free path stops with an upgrade prompt.
- [ ] Without a paid plan, over-allowance automation pauses with explanation; subscribing resumes it.
- [ ] Plans and prices are editable in Admin and reflected in the UI without code changes.
- [ ] Full subscription lifecycle works in demo mode: subscribe, renew, upgrade, downgrade, cancel, simulate payment failure → grace → expiry.
- [ ] A percentage coupon, a fixed coupon, and a free-days coupon all apply correctly with limits enforced.
- [ ] If an automation action isn't permitted by the API, it's disabled with an explanation — no workaround.

## Edge cases
Gateway webhook idempotency; proration on mid-cycle plan change; coupon expired/exhausted; multiple automations sharing allowance; suspended account automation pause.
