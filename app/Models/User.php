<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, LogsActivity, Notifiable, HasRoles, SoftDeletes;

    /**
     * Define the roles relationship manually to avoid using Spatie's HasRoles trait.
     */


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone_number',
        'password',
        'is_active',
        'verifikasi',
        'verification_locked_at',
        'verification_locked_by',
        'verification_duration',
        'rejection_reason',
        'nip_nik',
        'nia_nrp',
        'profile',
        'ekyc_verified_at',
        'verified_at',
        'verified_by',
    ];

    public function detail(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserDetail::class);
    }

    public function staff(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Staff::class);
    }

    public function locker(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'verification_locked_by');
    }

    public function verifier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function locations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function locationSessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LocationSession::class);
    }

    public function currentLocation(): ?\Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Location::class)->latestOfMany('captured_at');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'ekyc_verified_at' => 'datetime',
            'verification_locked_at' => 'datetime',
            'verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's avatar URL.
     */
    public function getAvatarAttribute(): ?string
    {
        return $this->profile
            ? \Illuminate\Support\Facades\Storage::url($this->profile)
            : ($this->detail?->foto_profil ? \Illuminate\Support\Facades\Storage::url($this->detail->foto_profil) : null);
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar',
    ];
}
