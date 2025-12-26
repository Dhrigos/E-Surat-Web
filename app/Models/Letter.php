<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\LogsActivity;

class Letter extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'subject',
        'priority',
        'category',
        'mail_type',
        'letter_type_id',
        'unit_id',
        'description',
        'content',
        'status',
        'created_by',
        'is_starred',
        'signature_positions',
        'reference_letter_id',
    ];

    protected $casts = [
        'signature_positions' => 'array',
        'is_starred' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvers(): HasMany
    {
        return $this->hasMany(LetterApprover::class)->orderBy('order');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(LetterAttachment::class);
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(LetterRecipient::class);
    }

    public function dispositions(): HasMany
    {
        return $this->hasMany(Disposition::class);
    }

    public function letterType(): BelongsTo
    {
        return $this->belongsTo(LetterType::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(LetterComment::class)->orderBy('created_at', 'asc');
    }

    public function referenceLetter(): BelongsTo
    {
        return $this->belongsTo(Letter::class, 'reference_letter_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Letter::class, 'reference_letter_id');
    }
}
