<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScriptRevision extends Model
{
    protected $table = 'scripts';
    protected $guarded = [];

    protected $casts = [
        'script' => 'array',
        'inputs' => 'array',
        'toggles' => 'array',
        'context_used' => 'array',
    ];

    public function script() { return $this->belongsTo(Script::class); }
}
