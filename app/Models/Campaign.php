<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $guarded = [];

    protected $casts = [
        'deliverables' => 'array',
        'compensation' => 'array',
        'requirements' => 'array',
        'application_deadline' => 'datetime',
        'campaign_start' => 'datetime',
        'campaign_end' => 'datetime',
    ];

    public function brand()
    {
        return $this->belongsTo(User::class, 'brand_id');
    }

    public function applications()
    {
        return $this->hasMany(CampaignApplication::class);
    }
}
