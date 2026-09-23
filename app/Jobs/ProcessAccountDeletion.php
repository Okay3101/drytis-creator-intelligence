<?php

namespace App\Jobs;

use App\Models\InstagramAccount;
use App\Models\Upload;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Hard-cleanup after account deletion: removes uploaded media, pushes tokens,
 * and marks IG connections revoked. Retained (legal/financial): invoices,
 * audit logs. Runs on the queue so the HTTP response is instant.
 */
class ProcessAccountDeletion implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId) {}

    public function handle(): void
    {
        $user = User::withTrashed()->find($this->userId);
        if (! $user) {
            return;
        }

        // Delete uploaded files (reel uploads, avatars)
        Upload::where('user_id', $this->userId)->get()->each(function (Upload $upload) {
            Storage::disk('local')->delete($upload->path);
            $upload->delete();
        });

        // Remove push tokens
        \App\Models\PushToken::where('user_id', $this->userId)->delete();

        // Revoke Instagram tokens + mark disconnected (official API disconnect)
        InstagramAccount::withTrashed()->where('creator_id', $this->userId)
            ->update(['connection_status' => 'deleted', 'access_token_enc' => null]);

        // Anonymize remaining profile content
        $user->creatorProfile()->update(['name' => null, 'bio' => null, 'avatar_path' => null, 'marketplace_profile' => null]);
        $user->brandProfile()->update(['description' => null, 'logo_path' => null]);
    }
}
