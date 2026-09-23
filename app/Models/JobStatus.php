<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class JobStatus extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = ['result' => 'array'];
}
