# Phase 9 — Notifications, Profile, Settings & Polish

## Notifications
- Native-feeling center: compact swipe-friendly cards, read/unread states (bold + dot), relative timestamps. Existing endpoints `/api/notifications`, `/notifications/read-all`, custom Notification model contract. Push token registration (`/api/push-tokens`) retained.
- Empty state + pull-to-refresh.

## Profile
- Simple: profile image, name, username, bio, niche, connected Instagram status/link. Edit inline where the existing `/api/profile` supports it. NOT an analytics dashboard.

## Settings
- Native grouped list: Account (email/password via `/api/password`) · Security · Instagram (Connected Accounts) · Notifications (preferences via `/api/notification-preferences`) · Automation · Privacy · Support (link to support chat `/api/support*`) · Delete Account (`DELETE /api/account` with confirmation bottom sheet).

## Support
- Simple chat thread with admin (body + is_admin contract), existing endpoints.

## Polish & performance pass
- Route-level lazy loading (React.lazy) for all screens; charts and heavy sections deferred.
- Skeleton loaders on every async screen; cached last-known UI for offline-ish feel where cheap.
- Micro-interaction audit: press states everywhere, score reveals, sheet transitions; remove any excess.
- Gestures: pull-to-refresh, swipe on lists where useful, long-press only where useful (e.g. copy script).

## Acceptance criteria
- [ ] Notifications list shows unread state, timestamps, mark-all-read works
- [ ] Profile shows the 6 required fields, no analytics content
- [ ] Settings shows the 8 sections and each opens a working sub-screen; Delete Account asks for confirmation
- [ ] Support chat sends and receives messages
- [ ] Initial load is split (lazy routes); skeletons show while loading
- [ ] No horizontal overflow and no unreachable control on 360–412px viewports (iPhone SE / Pixel sizes tested)
