<?php

namespace App\Services\Instagram;

use App\Models\InstagramAccount;

class InstagramAccountService
{
    public function __construct(private InstagramProvider $provider)
    {
    }

    public static function provider(): InstagramProvider
    {
        return app()->make(\App\Services\Instagram\InstagramProvider::class);
    }

    public function connectFromDemo(string $username, $user): InstagramAccount
    {
        $igUserId = 'demo-'.\Illuminate\Support\Str::slug($username).'-'.substr(md5($username.microtime()), 0, 6);

        $account = InstagramAccount::create([
            'creator_id' => $user->id,
            'ig_user_id' => $igUserId,
            'username' => $username,
            'ig_account_type' => 'CREATOR',
        ]);
        $account->setToken('demo-token-'.\Illuminate\Support\Str::random(20), now()->addDays(60));
        $account->update(['connection_status' => 'connected']);

        return $account;
    }

    public function connectFromCode(string $code, $user): array
    {
        $tokenData = $this->provider->exchangeCode($code);
        $me = $this->provider->me($tokenData['access_token']);

        if (! in_array($me['account_type'] ?? '', ['CREATOR', 'BUSINESS'], true)) {
            return [
                'error' => 'non_professional',
                'message' => 'Sirf professional (Creator ya Business) Instagram account connect ho sakta hai. '
                    .'Instagram app → Settings → Account type mein jaakar Professional banao, phir wapas aao.',
            ];
        }

        $account = InstagramAccount::updateOrCreate(
            ['creator_id' => $user->id, 'ig_user_id' => $me['id']],
            [
                'username' => $me['username'],
                'ig_account_type' => $me['account_type'],
                'connection_status' => 'connected',
            ]
        );
        $account->setToken(
            $tokenData['access_token'],
            now()->addSeconds($tokenData['expires_in'])
        );

        return ['account' => $account];
    }

    public function ensureFreshToken(InstagramAccount $account): bool
    {
        if ($this->provider->isDemo()) {
            return true;
        }
        if ($account->token_expires_at && $account->token_expires_at->lt(now()->addDays(7))) {
            try {
                $fresh = $this->provider->refreshLongLivedToken($account);
                $account->setToken($fresh['access_token'], now()->addSeconds($fresh['expires_in']));

                return true;
            } catch (\Throwable $e) {
                $account->update(['connection_status' => 'expired']);

                return false;
            }
        }

        return $account->connection_status === 'connected';
    }
}
