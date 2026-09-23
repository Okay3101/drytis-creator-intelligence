<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnosis extends Model
{
    protected $guarded = [];
    protected $casts = [
        'problems' => 'array',
        'strengths' => 'array',
        'evidence' => 'array',
        'recommendations' => 'array',
        'top_problem_keys' => 'array',
    ];
}
