<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    protected $guarded = [];
    protected $casts = [
        'data_coverage' => 'array',
        'results' => 'array',
    ];
}
