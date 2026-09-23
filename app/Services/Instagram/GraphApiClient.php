<?php

namespace App\Services\Instagram;

use App\Models\InstagramAccount;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Official Instagram Graph API client. In demo mode (INSTAGRAM_MODE=demo)
 * no network calls happen — DemoInstagramProvider serves deterministic
 * sample data instead. This class is only invoked with real tokens.
 */
class GraphApiClient implements InstagramProvider
{
    public function __construct(
        private string $baseUrl,
        private string $appId,
        private string $appSecret,
        private string $redirectUri,
    ) {
    }

    public function authorizationUrl(string $state): string
    {
        $params = http_build_query([
            'client_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'instagram_basic,instagram_manage_insights,pages_show_list',
            'state' => $state,
        ]);

        return 'https://api.instagram.com/oauth/authorize?'.$params;
    }

    public function exchangeCode(string $code): array
    {
        $res = Http::asForm()->post('https://api.instagram.com/oauth/access_token', [
            'client_id' => $this->appId,
            'client_secret' => $this->appSecret,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $this->redirectUri,
            'code' => $code,
        ])->throw()->json();

        // Short-lived → long-lived
        $long = Http::get('https://graph.instagram.com/access_token', [
            'grant_type' => 'ig_exchange_token',
            'client_secret' => $this->appSecret,
            'access_token' => $res['access_token'],
        ])->throw()->json();

        return [
            'access_token' => $long['access_token'] ?? $res['access_token'],
            'expires_in' => $long['expires_in'] ?? 60 * 86400,
            'user_id' => $res['user_id'] ?? null,
        ];
    }

    public function me(string $token): array
    {
        return Http::get("{$this->baseUrl}/me", [
            'fields' => 'id,username,account_type,media_count',
            'access_token' => $token,
        ])->throw()->json();
    }

    public function profile(InstagramAccount $account): array
    {
        $token = $account->decryptToken();

        return Http::get("{$this->baseUrl}/{$account->ig_user_id}", [
            'fields' => 'id,username,account_type,media_count,followers_count,profile_picture_url',
            'access_token' => $token,
        ])->throw()->json();
    }

    public function reels(InstagramAccount $account, int $limit = 50): array
    {
        $token = $account->decryptToken();
        $res = Http::get("{$this->baseUrl}/{$account->ig_user_id}/media", [
            'fields' => 'id,media_type,media_product_type,permalink,thumbnail_url,caption,media_url,timestamp',
            'access_token' => $token,
        ])->throw()->json();

        return collect($res['data'] ?? [])
            ->filter(fn ($m) => ($m['media_product_type'] ?? '') === 'REELS')
            ->take($limit)
            ->values()
            ->all();
    }

    public function insights(InstagramAccount $account, string $mediaId): array
    {
        $token = $account->decryptToken();
        $metrics = 'reach,likes,comments,saved,shares,total_interactions,ig_reels_video_view_total_time,plays';

        $res = Http::get("{$this->baseUrl}/{$mediaId}/insights", [
            'metric' => $metrics,
            'access_token' => $token,
        ])->json();

        $out = [];
        foreach ($res['data'] ?? [] as $row) {
            $out[$row['name']] = $row['values'][0]['value'] ?? null;
        }

        return $out;
    }

    public function refreshLongLivedToken(InstagramAccount $account): array
    {
        $token = $account->decryptToken();
        $res = Http::get('https://graph.instagram.com/refresh_access_token', [
            'grant_type' => 'ig_refresh_token',
            'access_token' => $token,
        ])->throw()->json();

        return [
            'access_token' => $res['access_token'],
            'expires_in' => $res['expires_in'] ?? 60 * 86400,
        ];
    }

    public function isDemo(): bool
    {
        return false;
    }
}
