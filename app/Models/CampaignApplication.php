<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignApplication extends Model
{
    protected $guarded = [];

    protected $casts = ['question_responses' => 'array'];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}
