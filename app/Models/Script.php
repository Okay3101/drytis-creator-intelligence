<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    protected $guarded = [];

    public function creator() { return $this->belongsTo(\App\Models\User::class, 'creator_id'); }

    public function instagramAccount() { return $this->belongsTo(\App\Models\InstagramAccount::class); }

    public function revisions() { return $this->hasMany(\App\Models\ScriptRevision::class); }

    protected $casts = [
        'insights' => 'array',
        'data_coverage' => 'array',
        'results' => 'array',
        'problems' => 'array',
        'strengths' => 'array',
        'evidence' => 'array',
        'recommendations' => 'array',
        'top_problem_keys' => 'array',
        'pattern' => 'array',
        'details' => 'array',
        'relevance' => 'array',
        'inputs' => 'array',
        'toggles' => 'array',
        'script' => 'array',
        'top_content' => 'array',
        'gaps' => 'array',
        'deliverables' => 'array',
        'compensation' => 'array',
        'requirements' => 'array',
        'question_responses' => 'array',
        'trigger' => 'array',
        'eligible_plans' => 'array',
        'value' => 'integer',
        'data' => 'array',
        'meta' => 'array',
        'revision_history' => 'array',
        'admin_permissions' => 'array',
        'notification_prefs' => 'array',
        'languages' => 'array',
        'audience' => 'array',
        'style' => 'array',
        'content_categories' => 'array',
        'objectives' => 'array',
        'marketplace_profile' => 'array',
        'read_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];
}
