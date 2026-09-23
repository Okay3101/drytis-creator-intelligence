<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->enum('account_type', ['creator', 'brand'])->index();
            $t->enum('status', ['active', 'suspended', 'deleted'])->default('active')->index();
            $t->string('otp_code_hash')->nullable();
            $t->timestamp('otp_expires_at')->nullable();
            $t->unsignedTinyInteger('otp_attempts')->default(0);
            $t->timestamp('otp_last_sent_at')->nullable();
            $t->boolean('is_admin')->default(false);
            $t->json('admin_permissions')->nullable();
            $t->json('notification_prefs')->nullable();
            $t->softDeletes();
        });

        // ---- Creator & brand ----
        Schema::create('creator_profiles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('name')->nullable();
            $t->string('username')->nullable();
            $t->text('bio')->nullable();
            $t->string('niche')->nullable();
            $t->string('avatar_path')->nullable();
            $t->string('location')->nullable();
            $t->json('languages')->nullable();
            $t->json('audience')->nullable();
            $t->json('style')->nullable();
            $t->json('content_categories')->nullable();
            $t->json('objectives')->nullable();
            $t->json('marketplace_profile')->nullable();
            $t->string('availability')->nullable();
            $t->timestamps();
        });

        Schema::create('brand_profiles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('brand_name');
            $t->text('description')->nullable();
            $t->string('logo_path')->nullable();
            $t->string('website')->nullable();
            $t->string('industry')->nullable();
            $t->string('location')->nullable();
            $t->timestamps();
        });

        // ---- Instagram ----
        Schema::create('instagram_accounts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->string('ig_user_id');
            $t->string('username');
            $t->string('ig_account_type', 32); // creator|business
            $t->text('access_token_enc')->nullable();
            $t->timestamp('token_expires_at')->nullable();
            $t->string('connection_status', 32)->default('connected'); // connected|expired|error
            $t->timestamp('last_synced_at')->nullable();
            $t->timestamps();
            $t->unique(['creator_id', 'ig_user_id']);
        });

        Schema::create('contents', function (Blueprint $t) {
            $t->id();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->string('ig_media_id')->index();
            $t->string('media_type', 32)->default('REEL');
            $t->string('permalink')->nullable();
            $t->string('thumbnail_url')->nullable();
            $t->text('caption')->nullable();
            $t->unsignedInteger('duration_seconds')->nullable();
            $t->json('insights')->nullable();
            $t->timestamp('posted_at')->nullable();
            $t->timestamps();
            $t->unique(['instagram_account_id', 'ig_media_id']);
        });

        Schema::create('analyses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->string('type', 48); // initial|diagnosis|refresh|...
            $t->string('status', 24)->default('pending'); // pending|running|completed|failed
            $t->json('data_coverage')->nullable();
            $t->json('results')->nullable();
            $t->string('confidence', 24)->nullable();
            $t->string('ai_model_version')->nullable();
            $t->string('error')->nullable();
            $t->timestamps();
        });

        Schema::create('diagnoses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->json('problems')->nullable();
            $t->json('strengths')->nullable();
            $t->json('evidence')->nullable();
            $t->json('recommendations')->nullable();
            $t->json('top_problem_keys')->nullable();
            $t->unsignedTinyInteger('content_health')->nullable();
            $t->enum('helpful_feedback', ['yes', 'no'])->nullable();
            $t->timestamps();
        });

        Schema::create('winning_patterns', function (Blueprint $t) {
            $t->id();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->string('category', 64)->nullable();
            $t->json('pattern');
            $t->json('evidence')->nullable();
            $t->string('confidence', 24)->default('moderate');
            $t->timestamps();
        });

        // ---- Competitors ----
        Schema::create('competitors', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->string('ig_user_id');
            $t->string('username');
            $t->string('status', 24)->default('active');
            $t->timestamps();
        });

        Schema::create('competitor_analyses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('competitor_id')->constrained()->cascadeOnDelete();
            $t->string('mode', 16)->default('quick'); // quick|full
            $t->string('status', 24)->default('pending');
            $t->json('top_content')->nullable();
            $t->json('patterns')->nullable();
            $t->json('gaps')->nullable();
            $t->timestamp('last_analyzed_at')->nullable();
            $t->string('error')->nullable();
            $t->timestamps();
        });

        // ---- Trends ----
        Schema::create('trends', function (Blueprint $t) {
            $t->id();
            $t->string('type', 32); // audio|topic|format|structure|hook|hashtag|search
            $t->string('title');
            $t->json('details')->nullable();
            $t->string('market', 32)->default('in');
            $t->string('niche', 64)->nullable();
            $t->string('language', 32)->nullable();
            $t->unsignedTinyInteger('momentum')->default(50);
            $t->unsignedTinyInteger('saturation')->default(50);
            $t->unsignedTinyInteger('popularity')->default(50);
            $t->string('status', 16)->default('trending'); // trending|emerging|saturated|declining
            $t->string('source', 64)->nullable();
            $t->timestamps();
        });

        Schema::create('creator_trend_states', function (Blueprint $t) {
            $t->id();
            $t->foreignId('trend_id')->constrained()->cascadeOnDelete();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->string('state', 16); // saved|dismissed|used
            $t->timestamps();
            $t->unique(['trend_id', 'creator_id']);
        });

        // ---- Create ----
        Schema::create('scripts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('instagram_account_id')->nullable()->constrained()->nullOnDelete();
            $t->text('idea');
            $t->json('inputs')->nullable();
            $t->json('toggles')->nullable(); // winning_patterns|competitor_insights|trends
            $t->json('script')->nullable();
            $t->string('mode', 16)->default('production'); // production|voiceover
            $t->foreignId('revision_of')->nullable()->constrained('scripts')->nullOnDelete();
            $t->text('revision_instruction')->nullable();
            $t->string('status', 24)->default('pending');
            $t->string('error')->nullable();
            $t->timestamps();
        });

        Schema::create('reel_readiness', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('instagram_account_id')->nullable()->constrained()->nullOnDelete();
            $t->string('media_path');
            $t->json('inputs')->nullable();
            $t->decimal('score', 3, 1)->nullable();
            $t->string('label', 48)->nullable();
            $t->json('strengths')->nullable();
            $t->json('problems')->nullable();
            $t->string('status', 24)->default('pending');
            $t->string('error')->nullable();
            $t->foreignId('previous_attempt_id')->nullable();
            $t->timestamps();
        });

        Schema::create('uploads', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('path');
            $t->string('mime', 64);
            $t->unsignedBigInteger('size');
            $t->string('validation_status', 24)->default('valid');
            $t->timestamp('retention_delete_at')->nullable();
            $t->timestamps();
        });

        // ---- Marketplace ----
        Schema::create('campaigns', function (Blueprint $t) {
            $t->id();
            $t->foreignId('brand_id')->constrained('users')->cascadeOnDelete();
            $t->string('name');
            $t->string('product')->nullable();
            $t->text('description')->nullable();
            $t->string('niche', 64)->nullable();
            $t->json('deliverables')->nullable();
            $t->json('compensation')->nullable();
            $t->timestamp('application_deadline')->nullable();
            $t->timestamp('campaign_start')->nullable();
            $t->timestamp('campaign_end')->nullable();
            $t->json('requirements')->nullable(); // [{key,label,value,type:required|preferred}]
            $t->unsignedInteger('number_of_creators')->default(1);
            $t->string('status', 24)->default('draft'); // draft|published|closed|completed
            $t->string('moderation_status', 24)->default('ok'); // ok|flagged|removed
            $t->timestamps();
        });

        Schema::create('campaign_applications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->text('message')->nullable();
            $t->json('question_responses')->nullable();
            $t->string('status', 24)->default('pending'); // pending|approved|rejected|withdrawn
            $t->timestamps();
            $t->unique(['campaign_id', 'creator_id']);
        });

        Schema::create('campaign_workspaces', function (Blueprint $t) {
            $t->id();
            $t->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->string('status', 24)->default('active');
            $t->string('payment_status', 24)->default('pending'); // pending|paid (label only in V1)
            $t->timestamps();
            $t->unique(['campaign_id', 'creator_id']);
        });

        Schema::create('deliverables', function (Blueprint $t) {
            $t->id();
            $t->foreignId('workspace_id')->constrained('campaign_workspaces')->cascadeOnDelete();
            $t->string('type', 24); // reel|story|post
            $t->text('requirements')->nullable();
            $t->timestamp('deadline')->nullable();
            $t->string('status', 24)->default('pending'); // pending|submitted|revision_requested|approved
            $t->timestamps();
        });

        Schema::create('deliverable_submissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('deliverable_id')->constrained()->cascadeOnDelete();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->string('media_path')->nullable();
            $t->text('notes')->nullable();
            $t->string('status', 24)->default('submitted'); // submitted|approved|revision_requested
            $t->json('revision_history')->nullable();
            $t->timestamps();
        });

        Schema::create('messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('workspace_id')->nullable()->constrained('campaign_workspaces')->cascadeOnDelete();
            $t->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });

        Schema::create('support_conversations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('status', 24)->default('open'); // open|pending|closed
            $t->foreignId('assigned_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('support_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('conversation_id')->constrained('support_conversations')->cascadeOnDelete();
            $t->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $t->boolean('is_admin')->default(false);
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });

        // ---- Automation & billing ----
        Schema::create('automations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('instagram_account_id')->constrained()->cascadeOnDelete();
            $t->foreignId('content_id')->nullable()->constrained()->nullOnDelete();
            $t->json('trigger')->nullable(); // {type: comment|dm, keywords: []}
            $t->text('response')->nullable();
            $t->boolean('follow_requirement')->default(false);
            $t->unsignedInteger('usage_count')->default(0);
            $t->string('status', 24)->default('active'); // active|paused|disabled
            $t->timestamps();
        });

        Schema::create('automation_usage', function (Blueprint $t) {
            $t->id();
            $t->foreignId('automation_id')->constrained()->cascadeOnDelete();
            $t->string('external_user_id', 64)->nullable();
            $t->string('interaction_type', 24);
            $t->string('billed', 8); // free|paid
            $t->timestamps();
        });

        Schema::create('plans', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->text('description')->nullable();
            $t->unsignedInteger('monthly_limit'); // interactions/month
            $t->unsignedInteger('price_paise')->default(0);
            $t->boolean('is_unlimited')->default(false);
            $t->boolean('active')->default(true);
            $t->unsignedSmallInteger('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('plan_id')->constrained();
            $t->string('status', 24)->default('active'); // active|grace|past_due|cancelled|expired
            $t->timestamp('current_period_end')->nullable();
            $t->timestamp('grace_until')->nullable();
            $t->string('gateway_customer_id')->nullable();
            $t->string('gateway_subscription_id')->nullable();
            $t->foreignId('coupon_id')->nullable();
            $t->timestamps();
        });

        Schema::create('subscription_invoices', function (Blueprint $t) {
            $t->id();
            $t->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $t->unsignedInteger('amount_paise');
            $t->unsignedInteger('amount_paid_paise')->default(0);
            $t->string('status', 24)->default('pending'); // pending|paid|failed
            $t->string('gateway_payment_id')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
        });

        Schema::create('coupons', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('type', 24); // percent|fixed|free_days|bonus_allowance
            $t->unsignedInteger('value');
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->unsignedInteger('usage_limit')->nullable();
            $t->unsignedInteger('per_user_limit')->default(1);
            $t->unsignedInteger('times_used')->default(0);
            $t->json('eligible_plans')->nullable();
            $t->boolean('active')->default(true);
            $t->foreignId('assigned_creator_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('marketing_campaign', 64)->nullable();
            $t->timestamps();
        });

        Schema::create('coupon_redemptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $t->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('subscription_id')->nullable();
            $t->timestamps();
        });

        // ---- Platform-wide ----
        Schema::create('notifications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('type', 48); // marketplace|ai|automation|messaging|system
            $t->string('event', 64);
            $t->string('title');
            $t->text('body')->nullable();
            $t->json('data')->nullable();
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'read_at']);
        });

        Schema::create('push_tokens', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('token')->unique();
            $t->string('platform', 16)->default('web');
            $t->timestamps();
        });

        Schema::create('platform_settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->json('value')->nullable();
            $t->unsignedInteger('version')->default(1);
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('action', 64);
            $t->string('subject_type', 64)->nullable();
            $t->unsignedBigInteger('subject_id')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
        });

        Schema::create('reports', function (Blueprint $t) {
            $t->id();
            $t->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $t->string('subject_type', 32); // campaign|user|content
            $t->unsignedBigInteger('subject_id');
            $t->text('reason');
            $t->string('status', 24)->default('open'); // open|resolved|dismissed
            $t->timestamps();
        });

        Schema::create('job_status', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('type', 48);
            $t->string('status', 24)->default('pending');
            $t->json('result')->nullable();
            $t->string('error')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        // v1 tables; drop in reverse dependency order (best effort)
        $tables = [
            'job_status', 'reports', 'audit_logs', 'platform_settings', 'push_tokens', 'notifications',
            'coupon_redemptions', 'coupons', 'subscription_invoices', 'subscriptions', 'plans',
            'automation_usage', 'automations', 'support_messages', 'support_conversations', 'messages',
            'deliverable_submissions', 'deliverables', 'campaign_workspaces', 'campaign_applications', 'campaigns',
            'uploads', 'reel_readiness', 'scripts', 'creator_trend_states', 'trends', 'competitor_analyses',
            'competitors', 'winning_patterns', 'diagnoses', 'analyses', 'contents', 'instagram_accounts',
            'brand_profiles', 'creator_profiles',
        ];
        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', function (Blueprint $t) {
            $t->dropColumn([
                'account_type', 'status', 'otp_code_hash', 'otp_expires_at', 'otp_attempts',
                'otp_last_sent_at', 'is_admin', 'admin_permissions', 'notification_prefs', 'deleted_at',
            ]);
        });
    }
};
