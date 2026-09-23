<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $guarded = [];

    protected $casts = [
        'value' => 'array',
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
        'meta' => 'array',
        'revision_history' => 'array',
    ];
}
