<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowDelegation extends Model
{
    protected $fillable = [
        'letter_approver_id',
        'delegated_from_user_id',
        'delegated_to_user_id',
        'reason',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function letterApprover()
    {
        return $this->belongsTo(LetterApprover::class);
    }

    public function delegatedFrom()
    {
        return $this->belongsTo(User::class, 'delegated_from_user_id');
    }

    public function delegatedTo()
    {
        return $this->belongsTo(User::class, 'delegated_to_user_id');
    }

    /**
     * Check if delegation is currently active
     */
    public function isCurrentlyActive()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now()->toDateString();
        
        if ($this->start_date > $now) {
            return false;
        }

        if ($this->end_date && $this->end_date < $now) {
            return false;
        }

        return true;
    }
}
