# Spec · Phase 6 — Admin Panel, Notifications, Security Hardening, QA

## Goal
Full-control admin panel, complete notification coverage, security hardening, and end-to-end QA.

## Work
1. Admin panel (`/admin` SPA + `/admin-api`): Dashboard (platform analytics: creators, brands, active users, registrations, IG connections/failures, AI analyses/scripts/readiness checks, error rates, campaigns/applications/collaborations, automation subscriptions/usage/revenue, coupon stats). Users (creators/brands, status, suspend). Instagram (connections, token health, API errors). AI (per-engine model config, prompt versions, diagnosis/readiness/trend/competitor thresholds, evaluation data). Trends (sources, moderation). Marketplace (campaigns, applications, reports, moderation). Automation (plans, limits, subscriptions). Coupons. Notifications (templates, broadcasts). Support inbox. Reports/abuse queue. Platform settings (versioned/audited).
2. Notifications: full coverage of marketplace, AI, automation, messaging, and system types across in-app + push; notification center; user controls (per-type mute); template management + admin broadcasts.
3. Security hardening: rate limiting, RBAC verification (creator/brand/admin + admin permission levels), data isolation tests, audit logging coverage, upload validation, secrets via env only, token encryption checks, HTTPS everywhere.
4. QA pass: full core loop (Detect → Explain → Fix → Create → Check → Analyze → Discover → Collaborate) exercised end-to-end; empty/loading/error/permission states verified across features; mobile + web responsive sweep; accessibility pass (labels, contrast, focus); documentation (README, env var reference, integration boundaries for Meta + payment gateway).

## Acceptance Criteria
- [ ] Admin can log in at /admin and use every section listed above; admin actions on settings are audited/versioned.
- [ ] Suspending a creator or brand blocks their access with a clear message.
- [ ] Notifications arrive in-app (and push where configured) for: campaign application/approval, diagnosis completed, readiness completed, usage warning, allowance nearing limit, payment failure, new campaign message, security alert — and can be muted per type by the user.
- [ ] Rate limiting blocks credential stuffing and API abuse attempts.
- [ ] A creator cannot read another creator's intelligence, and a brand cannot see creator diagnosis data (verified).
- [ ] The full core product loop works end-to-end in the running app with demo-mode integrations.
- [ ] README documents all required credentials/env configuration.

## Edge cases
Admin permission levels enforced; broadcast to targeted segments; deleted user referenced in historical records renders safely.
