<?php

namespace App\Services\Instagram;

use App\Models\InstagramAccount;

interface InstagramProvider
{
    public function authorizationUrl(string $state): string;

    /** @return array{access_token: string, expires_in: int, user_id?: string|null} */
    public function exchangeCode(string $code): array;

    /** Basic "me" after code exchange — must be a professional (creator/business) account. */
    public function me(string $token): array;

    public function profile(InstagramAccount $account): array;

    /** @return list<array{id: string, caption?: string, permalink?: string, thumbnail_url?: string, timestamp?: string}> */
    public function reels(InstagramAccount $account, int $limit = 50): array;

    public function insights(InstagramAccount $account, string $mediaId): array;

    /** @return array{access_token: string, expires_in: int} */
    public function refreshLongLivedToken(InstagramAccount $account): array;

    public function isDemo(): bool;
}
