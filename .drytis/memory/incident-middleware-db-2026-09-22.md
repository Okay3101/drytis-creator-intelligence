# Incident: config cache + Middleware corruption + DB name mismatch (Sept 22)

Session restart revealed three compounding failures, all fixed:
1. `.env` was empty & pointed at `...intelligence2` (nonexistent, no grants).
   Fixed via backend env-key override (set_env_value #51042 → correct db) + container restart.
2. `bootstrap/cache/config.php` corrupted (contained log text). Deleted; recreated via `artisan config:cache`.
3. FS corruption ate `app/Http/Middleware/` and `app/Http/Middleware2/` (dir became a file with tar-like junk),
   and `Controllers/Api/Admin/` became unreadable ("Bad message").
   Recreated MW2 by hand: EnsureAccountActive (checks users.status), EnsureAdmin (is_admin), EnsureAccountType (middleware('account.type:creator')).
   Laravel default Middleware/ classes NOT needed (Laravel 11+ bootstrap/app.php style, no Kernel).
   `Controllers/Api/Admin/` was EMPTY (admin routes all closures in routes/admin-api.php — nothing references App\Http\Controllers\Api\Admin). Left `Admin-corrupt` zombie dir; safe to ignore.
4. Model table mismatches fixed: ReelReadiness → `reel_readiness` (singular), AutomationUsage → `automation_usage`, ScriptRevision → `scripts` (revisions stored in scripts table via revision_of/revision_instruction).
5. Remote git repo is an EMPTY tree (initial commit, no files) — workspace is the ONLY source of truth. Publish ASAP.
6. /home/coder/.gitconfig was corrupted with log text — replaced with identity (Aditya / adityatam@drytis.com).

Verify-after-restart checklist: `.env` non-empty, bootstrap/cache/config.php valid PHP,
`php artisan route:list` works, curl /api/settings returns JSON.

Mobile app (frontend-mobile) now served at /m/ (public/m/), routes/web.php catch-all added
(exclusion regex updated to skip `m`). Setup script builds frontend-mobile + frontend-admin → public/.
Old creator bundle still at / from public/index.html; cutover in phase 10.
QA user: qa.mobile@test.dev / Passw0rd! (creator, verified via direct DB forceFill + sanctum token).