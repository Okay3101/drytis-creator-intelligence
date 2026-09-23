<?php

namespace App\Services\Instagram;

use App\Models\InstagramAccount;
use Illuminate\Support\Str;

/**
 * Deterministic demo data provider. Runs when INSTAGRAM_MODE=demo — no Meta
 * credentials required. Everything it returns is clearly labeled demo data.
 */
class DemoInstagramProvider implements InstagramProvider
{
    public function authorizationUrl(string $state): string
    {
        // Demo "OAuth" — the UI redirects straight back to the callback.
        return url('/auth/instagram/callback?demo=1&state='.urlencode($state));
    }

    public function exchangeCode(string $code): array
    {
        return [
            'access_token' => 'demo-token-'.Str::random(24),
            'expires_in' => 60 * 86400,
            'user_id' => 'demo-ig-'.Str::lower(Str::random(8)),
        ];
    }

    public function me(string $token): array
    {
        return [
            'id' => 'demo-ig-user',
            'username' => 'demo_creator',
            'account_type' => 'CREATOR', // professional — passes the gate
            'media_count' => 24,
        ];
    }

    public function profile(InstagramAccount $account): array
    {
        $seed = crc32($account->ig_user_id);

        return [
            'id' => $account->ig_user_id,
            'username' => $account->username,
            'account_type' => $account->ig_account_type ?? 'CREATOR',
            'followers_count' => 800 + ($seed % 7000),
            'media_count' => 24,
            'profile_picture_url' => null,
        ];
    }

    public function reels(InstagramAccount $account, int $limit = 50): array
    {
        $seed = crc32($account->ig_user_id);
        $hooks = [
            'POV: tumne bhi aisa kiya hai? 😅',
            '3 secrets jo koi nahi batata 🤫',
            'Ye galti mat karna! ❌',
            'Maine 30 din ye try kiya… results 🤯',
            'Beginners ke liye full guide 📚',
            'Trending audio ke saath ye try karo 🔥',
            'Meri story — 0 se shuruat 🌱',
            'React karke dekho, sach mein kaam karta hai',
        ];
        $reels = [];
        $count = 12 + ($seed % 8); // always ≥ 5 so the demo shows the full flow
        for ($i = 0; $i < min($count, $limit); $i++) {
            $noise = fn ($m) => (($seed >> ($i % 24)) % $m);
            $views = 900 + $noise(40000);
            $reach = (int) ($views * (0.7 + ($noise(20) / 100)));
            $reels[] = [
                'id' => 'demo-reel-'.$account->ig_user_id.'-'.$i,
                'media_type' => 'VIDEO',
                'media_product_type' => 'REELS',
                'permalink' => 'https://instagram.com/demo/reel/'.($i + 1),
                'thumbnail_url' => null,
                'caption' => $hooks[$i % count($hooks)].' #'.$account->username.' #reels #trending',
                'timestamp' => now()->subDays(3 * $i + ($noise(3)))->toIso8601String(),
                'demo_insights' => [
                    'plays' => $views,
                    'reach' => $reach,
                    'likes' => (int) ($views * (0.02 + $noise(4) / 100)),
                    'comments' => (int) ($views * 0.004),
                    'saved' => (int) ($views * 0.008),
                    'shares' => (int) ($views * 0.006),
                    'watch_percent_avg' => 40 + $noise(45),
                    'follower_gains' => $noise(60),
                ],
            ];
        }

        return $reels;
    }

    public function insights(InstagramAccount $account, string $mediaId): array
    {
        // Demo reels already carry demo_insights from reels().
        return [];
    }

    public function refreshLongLivedToken(InstagramAccount $account): array
    {
        return ['access_token' => $account->decryptToken(), 'expires_in' => 60 * 86400];
    }

    public function isDemo(): bool
    {
        return true;
    }
}
