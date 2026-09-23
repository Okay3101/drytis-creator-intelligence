<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code_hash',
        'password_reset_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'otp_last_sent_at' => 'datetime',
            'admin_permissions' => 'array',
            'notification_prefs' => 'array',
            'deleted_at' => 'datetime',
        ];
    }

    public function isCreator(): bool
    {
        return $this->account_type === 'creator';
    }

    public function isBrand(): bool
    {
        return $this->account_type === 'brand';
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function hasAdminPermission(string $permission): bool
    {
        if (! $this->isAdmin()) {
            return false;
        }
        $perms = $this->admin_permissions;

        return empty($perms) || in_array($permission, $perms) || in_array('*', $perms);
    }

    public function creatorProfile()
    {
        return $this->hasOne(CreatorProfile::class);
    }

    public function brandProfile()
    {
        return $this->hasOne(BrandProfile::class);
    }

    public function instagramAccounts()
    {
        return $this->hasMany(InstagramAccount::class, 'creator_id');
    }

    public function pushTokens()
    {
        return $this->hasMany(PushToken::class);
    }
}
