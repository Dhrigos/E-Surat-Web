<?php

namespace App\Policies;

use App\Models\Letter;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LetterPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Letter $letter): bool
    {
        // Creator can always view
        if ($letter->created_by === $user->id) {
            return true;
        }

        // Recipient can view
        if ($letter->recipients()->where('recipient_type', 'user')->where('recipient_id', $user->id)->exists()) {
            return true;
        }

        // Approver (current or past) can view
         if ($letter->approvers()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Letter $letter): bool
    {
        return $user->id === $letter->created_by && in_array($letter->status, ['draft', 'revision', 'pending']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Letter $letter): bool
    {
        return $user->id === $letter->created_by && in_array($letter->status, ['draft', 'revision', 'pending']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Letter $letter): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Letter $letter): bool
    {
        return false;
    }

    /**
     * Determine whether the user can approve the letter.
     */
    public function approve(User $user, Letter $letter): bool
    {
        $currentApprover = $letter->approvers()
            ->where('status', 'pending')
            ->orderBy('order', 'asc')
            ->first();

        if (!$currentApprover) {
            return false;
        }

        // Check if user is the assigned approver or the original approver (delegation)
        return $currentApprover->user_id === $user->id || 
               ($currentApprover->original_user_id ?? null) === $user->id;
    }
}
