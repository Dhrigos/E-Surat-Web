<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LocationSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'started_at',
        'ended_at',
        'purpose',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'location_session_id');
    }

    /**
     * Check if session is currently active
     */
    public function isActive(): bool
    {
        return $this->ended_at === null;
    }

    /**
     * End the tracking session
     */
    public function end(): void
    {
        $this->update(['ended_at' => now()]);
    }

    /**
     * Get session duration in seconds
     */
    public function duration(): ?int
    {
        if (! $this->ended_at) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->ended_at);
    }
}
