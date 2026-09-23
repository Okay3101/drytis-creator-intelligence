<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Automation plans (prices/limits are Admin-configurable at runtime) ----
        $plans = [
            ['name' => 'Free', 'slug' => 'free', 'monthly_limit' => 25, 'price_paise' => 0, 'is_unlimited' => false, 'sort_order' => 0,
             'description' => 'Har post pe 25 free automated interactions.'],
            ['name' => 'Starter', 'slug' => 'starter', 'monthly_limit' => 500, 'price_paise' => 19900, 'is_unlimited' => false, 'sort_order' => 1,
             'description' => '500 automated interactions per month.'],
            ['name' => 'Growth', 'slug' => 'growth', 'monthly_limit' => 3000, 'price_paise' => 49900, 'is_unlimited' => false, 'sort_order' => 2,
             'description' => '3,000 automated interactions per month.'],
            ['name' => 'Unlimited', 'slug' => 'unlimited', 'monthly_limit' => 0, 'price_paise' => 99900, 'is_unlimited' => true, 'sort_order' => 3,
             'description' => 'Unlimited automated interactions.'],
        ];
        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }

        // ---- Platform settings (defaults; all editable from Admin, versioned) ----
        $defaults = [
            'automation.free_per_post' => 25,
            'automation.grace_days' => 3,
            'diagnosis.min_reels' => 5,
            'diagnosis.confidence.min_reels_for_high' => 20,
            'competitors.max' => 3,
            'competitors.top_content_count' => 5,
            'uploads.max_size_mb' => 500,
            'uploads.allowed_mimes' => ['video/mp4', 'video/quicktime'],
            'uploads.retention_days' => 30,
            'trends.refresh_hours' => 12,
            'marketplace.max_campaign_creators' => 50,
            'ai.default_model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        ];
        foreach ($defaults as $key => $value) {
            if (! \App\Models\PlatformSetting::where('key', $key)->exists()) {
                SettingsService::set($key, $value, null);
            }
        }

        // ---- Demo admin account (dev/demo mode only) ----
        if (app()->environment('local', 'development', 'demo') && ! \App\Models\User::where('email', 'admin@drytis.dev')->exists()) {
            $admin = \App\Models\User::create([
                'account_type' => 'creator', // admin is a role flag, account_type kept for FK compat
                'name' => 'Platform Admin',
                'email' => 'admin@drytis.dev',
                'password' => 'Admin@12345',
                'email_verified_at' => now(),
                'is_admin' => true,
                'admin_permissions' => ['*'],
            ]);
            $admin->creatorProfile()->create(['name' => 'Platform Admin']);
        }
    }
}
