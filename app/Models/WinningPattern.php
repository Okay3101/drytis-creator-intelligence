<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WinningPattern extends Model
{
    protected $guarded = [];
    protected $casts = [
        'pattern' => 'array',
        'evidence' => 'array',
    ];
}
