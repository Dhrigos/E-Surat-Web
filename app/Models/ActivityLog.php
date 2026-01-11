<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'causer_type',
        'causer_id',
        'action',
        'event',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'batch_uuid',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * Get the user who performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the entity that caused the activity (polymorphic)
     */
    public function causer(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the subject of the activity (polymorphic)
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter by action
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by event
     */
    public function scopeForEvent($query, string $event)
    {
        return $query->where('event', $event);
    }

    /**
     * Scope to filter by batch
     */
    public function scopeInBatch($query, string $batchUuid)
    {
        return $query->where('batch_uuid', $batchUuid);
    }

    /**
     * Scope to filter by causer
     */
    public function scopeCausedBy($query, Model $causer)
    {
        return $query->where('causer_type', get_class($causer))
            ->where('causer_id', $causer->id);
    }

    /**
     * Scope to filter by subject
     */
    public function scopeForSubject($query, Model $subject)
    {
        return $query->where('subject_type', get_class($subject))
            ->where('subject_id', $subject->id);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get changes from properties
     */
    public function getChanges(): array
    {
        return $this->properties['attributes'] ?? [];
    }

    /**
     * Get old values from properties
     */
    public function getOldValues(): array
    {
        return $this->properties['old'] ?? [];
    }

    /**
     * Check if activity has property changes
     */
    public function hasPropertyChanges(): bool
    {
        return ! empty($this->properties['attributes']) && ! empty($this->properties['old']);
    }
}
