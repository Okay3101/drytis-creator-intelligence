# Phase 7 — Marketplace & Campaign Workspace (mobile)

## Campaign feed (`/marketplace`)
- Vertical campaign cards (no tables): campaign name, compensation (₹), chips (deliverables count, location, niche, language), deadline, eligibility chip (🟢 Eligible / not eligible with reason), tactile **Apply** button.
- Creator + Brand views: brands see their campaigns + applicants (brand nav "My Campaigns").

## Campaign detail
- Bottom sheet or page with collapsible sections: Brand, Compensation, Deliverables, Deadline, Requirements, Preferred criteria, Location, Language, Usage rights, Exclusivity, Description.
- Sticky bottom **Apply Now** bar (safe-area padded).

## Application flow (minimal)
- Tap Apply → single application-message textarea (+ brand's required questions if any) → **Submit Application**. No extra forms.

## Approval gating & workspace
- Before brand approval: application/message submission only; full chat locked with a clear "Unlocks after approval" state.
- After approval: **Campaign Workspace** unlocks — tabbed (mobile segmented control): Chat (threaded messages), Deliverables (checklist), Content (submissions), Review/Revisions, Payment info where enabled.

## Backend note
Campaign/workspace routes may be missing in `routes/api.php` (models exist). Expose the needed read/write routes reusing existing controllers/logic — no business-logic changes.

## Acceptance criteria
- [ ] Marketplace renders vertical campaign cards with eligibility + deadline + Apply
- [ ] Detail page shows all 11 fields in collapsible sections with sticky Apply Now
- [ ] Application is message (+required questions) only, submits successfully
- [ ] Chat is locked pre-approval and unlocks after approval
- [ ] Workspace tabs (Chat/Deliverables/Content/Review/Payment) all function
- [ ] No horizontal overflow at 360–412px
