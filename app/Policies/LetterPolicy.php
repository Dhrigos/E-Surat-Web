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
        $staff = $user->staff;
        if (!$staff || !$staff->jabatan) {
            return false;
        }
        
        $userPosition = strtolower($staff->jabatan->nama);
        
        foreach ($letter->approvers as $approver) {
            $requiredPosition = str_replace('-', ' ', strtolower($approver->approver_id));
            if (str_contains($userPosition, $requiredPosition) || str_contains($requiredPosition, $userPosition)) {
                return true;
            }
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
        $staff = $user->staff;
        if (!$staff || !$staff->jabatan) {
            return false;
        }

        $currentApprover = $letter->approvers()
            ->where('status', 'pending')
            ->orderBy('order', 'asc')
            ->first();

        if (!$currentApprover) {
            return false;
        }

        $userPosition = strtolower($staff->jabatan->nama);
        $requiredPosition = str_replace('-', ' ', strtolower($currentApprover->approver_id));

        return str_contains($userPosition, $requiredPosition) || str_contains($requiredPosition, $userPosition);
    }
}
