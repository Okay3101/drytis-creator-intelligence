<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create an in-app notification (and dispatch push when a token exists).
     * Respects the user's per-type notification preferences.
     */
    public function notify(User $user, string $type, string $event, string $title, ?string $body = null, array $data = []): ?Notification
    {
        $prefs = $user->notification_prefs ?? [];
        if (($prefs['muted'] ?? []) && in_array($type, $prefs['muted'], true)) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'event' => $event,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);

        // Push channel: webhook-style dispatch point. In V1 web push tokens are
        // registered here; actual FCM/FCM-HTTP delivery attaches behind PUSH_DRIVER env.
        if (config('services.push.driver')) {
            \App\Jobs\SendPushNotification::dispatch($user->id, $title, $body ?? '', $data);
        }


        return $notification;
    }
}
