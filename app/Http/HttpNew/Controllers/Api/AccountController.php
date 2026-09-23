<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function settings()
    {
        $keys = [
            'automation.free_per_post', 'diagnosis.min_reels', 'competitors.max',
            'trends.refresh_hours', 'platform.name',
        ];
        $map = [
            'automation.free_per_post' => 'free_automation_per_post',
            'diagnosis.min_reels' => 'min_reels_diagnosis',
            'competitors.max' => 'max_competitors',
        ];
        $out = [];
        foreach ($keys as $key) {
            $setting = PlatformSetting::where('key', $key)->first();
            if ($setting !== null) {
                $out[$map[$key] ?? $key] = $setting->value;
            }
        }
        if (! isset($out['max_competitors'])) {
            $out['max_competitors'] = 3;
        }

        return response()->json($out);
    }

    public function profile(Request $r)
    {
        $user = $r->user();
        $data = $r->validate([
            'name' => 'sometimes|string|max:120',
            'niche' => 'nullable|string|max:120',
            'follower_count' => 'nullable|integer|min:0',
            'content_goal' => 'nullable|string|max:120',
            'posting_frequency' => 'nullable|string|max:60',
            'language' => 'nullable|string|max:40',
        ]);

        if (isset($data['name'])) {
            $user->update(['name' => $data['name']]);
        }

        if ($user->account_type === 'creator') {
            $profile = $user->creatorProfile()->firstOrCreate([]);
            $profile->update(collect($data)->only(['niche', 'content_goal', 'posting_frequency', 'language'])->all());
            if (isset($data['follower_count'])) {
                $profile->forceFill(['audience' => array_merge($profile->audience ?? [], ['followers' => (int) $data['follower_count']])])->save();
            }
        } else {
            $user->brandProfile()->firstOrCreate([]);
        }

        return response()->json(['message' => 'Profile updated.', 'user' => app(AuthController::class)->me($r)->getData(true)['user']]);
    }

    public function updatePassword(Request $r)
    {
        $data = $r->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8',
        ]);
        $user = $r->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password galat hai.'], 422);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Password badal diya.']);
    }

    public function notificationPrefs(Request $r)
    {
        $data = $r->validate([
            'email' => 'nullable|boolean',
            'push' => 'nullable|boolean',
            'marketing' => 'nullable|boolean',
            'campaign_updates' => 'nullable|boolean',
            'trend_alerts' => 'nullable|boolean',
        ]);

        $prefs = array_merge($r->user()->notification_prefs ?? [], $data);
        $r->user()->update(['notification_prefs' => $prefs]);

        return response()->json(['prefs' => $prefs]);
    }

    public function registerPushToken(Request $r)
    {
        $data = $r->validate(['token' => 'required|string', 'platform' => 'nullable|string|max:20']);
        $r->user()->pushTokens()->updateOrCreate(
            ['token' => $data['token']],
            ['platform' => $data['platform'] ?? 'web']
        );

        return response()->json(['message' => 'Push token saved.']);
    }

    public function notifications(Request $r)
    {
        $query = \App\Models\Notification::where('user_id', $r->user()->id);
        if ($r->get('tab') === 'unread') {
            $query->whereNull('read_at');
        }
        $items = $query->orderByDesc('created_at')->limit(50)->get()->map(fn ($n) => [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'body' => $n->body,
            'read_at' => $n->read_at,
            'created_at' => $n->created_at?->toIso8601String(),
        ]);

        return response()->json(['data' => $items]);
    }

    public function markNotificationsRead(Request $r)
    {
        \App\Models\Notification::where('user_id', $r->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Sab notifications read mark ho gaye.']);
    }
}
