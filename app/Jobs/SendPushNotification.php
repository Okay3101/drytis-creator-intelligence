<?php

namespace App\Jobs;

use App\Models\PushToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $userId,
        public string $title,
        public string $body,
        public array $data = []
    ) {}

    public function handle(): void
    {
        $driver = config('services.push.driver');
        $endpoint = config('services.push.endpoint');

        if (! $driver || ! $endpoint) {
            return; // push not configured — in-app notification is the fallback
        }

        $tokens = PushToken::where('user_id', $this->userId)->pluck('token');

        foreach ($tokens as $token) {
            try {
                Http::withToken(config('services.push.key'))
                    ->post($endpoint, [
                        'to' => $token,
                        'title' => $this->title,
                        'body' => $this->body,
                        'data' => $this->data,
                    ])->throw();
            } catch (\Throwable $e) {
                Log::warning('push_failed', ['token' => substr($token, 0, 8).'…', 'error' => $e->getMessage()]);
            }
        }
    }
}
