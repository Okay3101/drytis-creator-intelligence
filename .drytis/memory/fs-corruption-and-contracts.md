# Workspace ext4 corruption — recurring hazard (project 3643)

Symptoms: `Structure needs cleaning` (errno=117), `Bad message`, un-deletable
empty dirs ("Directory not empty" though ls shows nothing), files/dirs vanishing
(frontend/ + frontend-admin/ were lost once), corrupted files (binary junk in
bootstrap/cache/packages.php, laravel.log, .gitconfig).

Workarounds that worked:
- rm + re-create corrupted files (laravel.log, packages.php + `artisan package:discover`).
- Un-removable empty dirs: `mv` fails too; copy siblings out, rm -rf parent, recreate.
- Corrupted dirs that "can't" be removed: mv them into /workspace/tmp, or rebuild
  the parent dir from a backup copy.
- After ANY odd include/parse error on a file that should be fine: re-check the
  file actually contains what you wrote (controllers under app/Http/Controllers/Api
  vanished once — AuthController/AccountController/SupportController rewritten).
- Old Laravel welcome page served = backend exception page, not the SPA.

# API contracts (Phase 0, keep consistent going forward)
- support_conversations: no last_message_at column (use updated_at);
  support_messages: `body` + `is_admin` (NOT message/sender_type).
- notifications table is custom (user_id, type, event, title, body, data, read_at)
  — do NOT use $user->notifications() (Laravel notifiable expects
  notifiable_type/ID). Query App\Models\Notification directly.
- platform_settings keys are dotted: automation.free_per_post (=30),
  diagnosis.min_reels (=5), competitors.max (=3), trends.refresh_hours, etc.
  SettingsService::get/set caches forever.
- Admin login: POST /api/admin/login (admin@drytis.dev / Admin@12345, seeded dev-only).
- Frontend SPA served from public/ (Caddy root /workspace/public), admin SPA at
  /admin (public/admin/, Laravel catch-all route for /admin and /admin/{any}).
- /api/settings returns free_automation_per_post/min_reels_diagnosis/max_competitors.
