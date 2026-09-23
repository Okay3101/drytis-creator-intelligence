# Spec · Phase 4 — Marketplace (Campaign Board)

## Goal
Brand → creator campaign marketplace end-to-end: campaigns, applications, approval, workspace with chat + deliverables.

## Work
1. Brand registration + profile (separate account type; no switching).
2. Campaign creation: Basic (name, brand/product, description, niche, deliverables, compensation, application deadline, campaign period) + Advanced (min followers, engagement reqs, audience, location, language, content requirements/restrictions, number of creators, usage rights, exclusivity, other criteria) each item marked Required vs Preferred. Draft → Publish (no admin pre-approval; moderation/reporting available).
3. Creator discovery: campaign feed + filters (niche, compensation, location, language, type, deadline). Eligibility badge: Eligible / Partially Eligible / Application unavailable (required criteria block; preferred don't).
4. Application: one-tap with auto-attached marketplace profile (public-safe fields only — NEVER private intelligence: no Content Health, weaknesses, readiness, internal scores), optional application message, brand-required questions answered before submit.
5. Brand dashboard: campaigns, applications review, approve/reject; approval opens Campaign Workspace + chat. No creator→brand DM before approval.
6. Workspace: Overview (brief/brand/creator/dates/compensation), Deliverables (types, deadlines, status), Content (upload → submit → brand review → approve / revision requested, revision history), Chat (campaign-scoped), Payment status field (pending/paid label only — no processing, no escrow).
7. Brand campaign analytics: applications, selected, active collaborations, deliverables completed, submissions, status.
8. Creator marketplace profile editor (public-safe fields, portfolio/top content, availability, collaboration preferences).

## Acceptance Criteria
- [ ] A brand registers, creates a campaign with required/preferred criteria, publishes it, and it appears in the creator feed with working filters.
- [ ] Eligibility is computed correctly: required-criterion failure blocks application; preferred-only misses show "Partially Eligible" but allow applying.
- [ ] One-tap application attaches the marketplace profile; brand-required questions gate submission; no private AI intelligence appears anywhere brands can see.
- [ ] Brand approves → workspace + chat open for both; before approval, creators cannot message the brand.
- [ ] Deliverable flow works: creator submits, brand requests revision, creator resubmits, brand approves; revision history visible.
- [ ] Campaign analytics show application/collaboration counts.
- [ ] Closed/expired campaigns show an explanatory state.

## Edge cases
Deadline passed; campaign filled (number of creators reached); report/abuse action hides campaign; brand account suspension.
