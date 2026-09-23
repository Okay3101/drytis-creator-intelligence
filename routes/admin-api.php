<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\SupportController;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Admin API — every route requires is_admin.
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('login-test', fn () => response()->json(['ok' => true]));

    Route::get('me', fn (Request $r) => response()->json(['user' => $r->user()->only('id', 'name', 'email')]));

    Route::get('dashboard/stats', function () {
        return response()->json(['data' => [
            'creators' => \App\Models\User::where('account_type', 'creator')->count(),
            'brands' => \App\Models\User::where('account_type', 'brand')->count(),
            'new_registrations_7d' => \App\Models\User::where('created_at', '>=', now()->subDays(7))->count(),
            'ig_connections' => \App\Models\InstagramAccount::count(),
            'campaigns' => \App\Models\Campaign::count(),
            'applications' => \App\Models\CampaignApplication::count(),
            'active_subscriptions' => \App\Models\Subscription::where('status', 'active')->count(),
            'coupons_active' => \App\Models\Coupon::where('active', 1)->count(),
            'open_reports' => \App\Models\Report::where('status', 'open')->count(),
            'open_support' => \App\Models\SupportConversation::whereIn('status', ['open', 'pending'])->count(),
        ]]);
    });

    // ---- Users management ----
    Route::get('users', function (Request $r) {
        $q = \App\Models\User::query()
            ->when($r->filled('search'), fn ($w) => $w->where(fn ($x) => $x
                ->where('email', 'like', "%{$r->search}%")
                ->orWhere('name', 'like', "%{$r->search}%")))
            ->when($r->filled('account_type'), fn ($w) => $w->where('account_type', $r->account_type))
            ->orderByDesc('created_at');

        $users = $q->limit(100)->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'account_type' => $u->account_type,
            'status' => $u->status ?? 'active',
            'created_at' => $u->created_at?->toIso8601String(),
        ]);

        return response()->json(['data' => $users]);
    });

    Route::post('users', function (Request $r) {
        $data = $r->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190|unique:users,email',
            'password' => 'required|string|min:8',
            'account_type' => 'required|in:creator,brand',
        ]);

        $user = \App\Models\User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'account_type' => $data['account_type'],
            'status' => 'active',
            'email_verified_at' => now(), // admin-created accounts are pre-verified
        ]);

        // Existing profile architecture — same as normal signup.
        if ($user->isCreator()) {
            \App\Models\CreatorProfile::create(['user_id' => $user->id, 'name' => $user->name]);
        } else {
            \App\Models\BrandProfile::create(['user_id' => $user->id, 'brand_name' => $user->name]);
        }

        \App\Models\AuditLog::create([
            'actor_id' => $r->user()->id,
            'action' => 'ADMIN_CREATED_USER',
            'subject_type' => 'user',
            'subject_id' => $user->id,
            'meta' => json_encode(['account_type' => $user->account_type, 'email' => $user->email]),
        ]);

        return response()->json([
            'message' => 'User account created successfully.',
            'data' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'account_type' => $user->account_type, 'status' => $user->status],
        ], 201);
    });

    Route::post('users/{id}/suspend', function (Request $r, string $id) {
        $user = \App\Models\User::findOrFail($id);
        $user->forceFill(['status' => 'suspended'])->save();
        $user->tokens()->delete();
        \App\Models\AuditLog::create(['actor_id' => $r->user()->id, 'action' => 'user.suspend', 'subject_type' => 'user', 'subject_id' => $user->id]);

        return response()->json(['message' => 'User suspended.']);
    });

    Route::post('users/{id}/activate', function (Request $r, string $id) {
        $user = \App\Models\User::findOrFail($id);
        $user->forceFill(['status' => 'active'])->save();
        \App\Models\AuditLog::create(['actor_id' => $r->user()->id, 'action' => 'user.activate', 'subject_type' => 'user', 'subject_id' => $user->id]);

        return response()->json(['message' => 'User activated.']);
    });

    // ---- Platform settings ----
    Route::get('settings', function () {
        $all = \App\Models\PlatformSetting::orderBy('key')->get()
            ->mapWithKeys(fn ($s) => [$s->key => $s->value]);

        return response()->json(['data' => $all]);
    });

    Route::put('settings', function (Request $r) {
        $data = $r->validate(['*' => 'present']);
        $payload = $r->json()->all();
        foreach ($payload as $key => $value) {
            if ($key === '*' || ! \App\Models\PlatformSetting::where('key', $key)->exists()) {
                continue;
            }
            SettingsService::set($key, $value, $r->user()->id);
        }

        return response()->json(['message' => 'Settings saved.']);
    });

    // ---- Coupons ----
    Route::get('coupons', function () {
        return response()->json(['data' => \App\Models\Coupon::orderByDesc('created_at')->get([
            'id', 'code', 'type', 'value', 'active', 'expires_at', 'max_redemptions', 'redemption_count',
        ])->map(fn ($c) => [
            'id' => $c->id,
            'code' => $c->code,
            'type' => $c->type,
            'value' => (float) $c->value,
            'status' => $c->active ? 'active' : 'inactive',
            'expires_at' => $c->expires_at,
            'max_redemptions' => $c->max_redemptions,
            'redemption_count' => $c->redemption_count,
        ])]);
    });

    Route::post('coupons', function (Request $r) {
        $data = $r->validate([
            'code' => 'required|string|max:40|unique:coupons,code',
            'type' => 'required|in:percent,flat',
            'value' => 'required|numeric|min:0',
            'max_redemptions' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);
        $coupon = \App\Models\Coupon::create([
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => $data['value'],
            'max_redemptions' => $data['max_redemptions'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'active' => true,
        ]);
        \App\Models\AuditLog::create(['actor_id' => $r->user()->id, 'action' => 'coupon.create', 'subject_type' => 'coupon', 'subject_id' => $coupon->id]);

        return response()->json(['data' => $coupon], 201);
    });

    Route::put('coupons/{id}', function (Request $r, string $id) {
        $coupon = \App\Models\Coupon::findOrFail($id);
        $data = $r->validate([
            'active' => 'nullable|boolean',
            'value' => 'nullable|numeric|min:0',
            'type' => 'nullable|in:percent,flat',
        ]);
        $coupon->update(collect($data)->filter(fn ($v) => $v !== null)->all());

        return response()->json(['data' => $coupon]);
    });

    Route::delete('coupons/{id}', function (Request $r, string $id) {
        $coupon = \App\Models\Coupon::findOrFail($id);
        $coupon->delete();
        \App\Models\AuditLog::create(['actor_id' => $r->user()->id, 'action' => 'coupon.delete', 'subject_type' => 'coupon', 'subject_id' => $id]);

        return response()->json(['message' => 'Coupon deleted.']);
    });

    // ---- Reports / moderation ----
    Route::get('reports', fn () => response()->json(['data' => \App\Models\Report::latest()->limit(100)->get()]));

    Route::patch('reports/{id}', function (Request $r, string $id) {
        $data = $r->validate(['status' => 'required|in:resolved,dismissed']);
        $report = \App\Models\Report::findOrFail($id);
        $report->update($data);
        \App\Models\AuditLog::create(['actor_id' => $r->user()->id, 'action' => 'report.'.$data['status'], 'subject_type' => 'report', 'subject_id' => $report->id]);

        return response()->json(['message' => 'Report updated.']);
    });

    // ---- Audit log ----
    Route::get('audit-logs', fn () => response()->json(['data' => \App\Models\AuditLog::latest()->limit(100)->get()]));

    // ---- Support inbox ----
    Route::get('support/conversations', [SupportController::class, 'adminConversations']);
    Route::get('support/conversations/{id}', [SupportController::class, 'adminConversation']);
    Route::post('support/conversations/{id}/reply', [SupportController::class, 'adminReply']);
    Route::post('support/conversations/{id}/close', [SupportController::class, 'adminCloseConversation']);

    // ---- Broadcast notification ----
    Route::post('broadcast', function (Request $r) {
        $data = $r->validate([
            'audience' => 'required|in:all,creators,brands',
            'title' => 'required|string|max:160',
            'body' => 'nullable|string|max:2000',
        ]);
        $query = \App\Models\User::query();
        if ($data['audience'] !== 'all') {
            $query->where('account_type', rtrim($data['audience'], 's'));
        }
        $count = 0;
        $query->chunkById(500, function ($users) use (&$count, $data) {
            foreach ($users as $user) {
                app(\App\Services\NotificationService::class)->notify($user, 'system', 'broadcast', $data['title'], $data['body'] ?? null);
                $count++;
            }
        });

        return response()->json(['message' => "Broadcast sent to {$count} users."]);
    });
});
