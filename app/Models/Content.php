<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    protected $guarded = [];
    protected $casts = [
        'posted_at' => 'datetime',
        'insights' => 'array',
    ];
}
