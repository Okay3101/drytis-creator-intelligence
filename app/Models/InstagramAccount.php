<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class InstagramAccount extends Model
{
    protected $guarded = [];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function diagnoses()
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function latestDiagnosis()
    {
        return $this->hasOne(Diagnosis::class)->latestOfMany();
    }

    public function winningPatterns()
    {
        return $this->hasMany(WinningPattern::class);
    }

    public function analyses()
    {
        return $this->hasMany(Analysis::class);
    }

    public function encryptToken(string $token): string
    {
        return encrypt($token);
    }

    public function setToken(string $plain, $expiresAt): void
    {
        $this->update([
            'access_token_enc' => encrypt($plain),
            'token_expires_at' => $expiresAt,
        ]);
    }

    public function decryptToken(): string
    {
        return decrypt($this->access_token_enc);
    }
}
