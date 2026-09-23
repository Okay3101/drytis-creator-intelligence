<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    public static function get(string $key, $default = null)
    {
        $settings = Cache::rememberForever('platform_settings', function () {
            return PlatformSetting::query()->pluck('value', 'key')->toArray();
        });

        return $settings[$key] ?? $default;
    }

    public static function set(string $key, $value, ?int $updatedBy = null): PlatformSetting
    {
        $setting = PlatformSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'version' => PlatformSetting::where('key', $key)->value('version') + 1 ?? 1,
                'updated_by' => $updatedBy,
            ]
        );

        self::flush();

        AuditLog::create([
            'actor_id' => $updatedBy,
            'action' => 'settings.update',
            'subject_type' => 'platform_setting',
            'subject_id' => $setting->id,
            'meta' => ['key' => $key, 'value' => $value, 'version' => $setting->version],
        ]);

        return $setting;
    }

    public static function flush(): void
    {
        Cache::forget('platform_settings');
    }
}
