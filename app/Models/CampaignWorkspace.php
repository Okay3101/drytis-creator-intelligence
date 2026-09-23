<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignWorkspace extends Model
{
    protected $guarded = [];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function deliverables()
    {
        return $this->hasMany(Deliverable::class, 'workspace_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'workspace_id');
    }
}
