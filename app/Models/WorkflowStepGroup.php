<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowStepGroup extends Model
{
    protected $fillable = [
        'workflow_id',
        'group_order',
        'approval_type',
        'description',
    ];

    protected $casts = [
        'group_order' => 'integer',
    ];

    public function workflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function steps()
    {
        return $this->hasMany(ApprovalWorkflowStep::class, 'group_id')->orderBy('order');
    }

    /**
     * Check if all approvers in this group have approved
     */
    public function isFullyApproved($letterId)
    {
        $totalSteps = $this->steps()->count();
        $approvedSteps = $this->steps()
            ->whereHas('letterApprovers', function($q) use ($letterId) {
                $q->where('letter_id', $letterId)
                  ->where('status', 'approved');
            })
            ->count();

        switch ($this->approval_type) {
            case 'all':
                return $approvedSteps === $totalSteps;
            case 'any':
                return $approvedSteps >= 1;
            case 'majority':
                return $approvedSteps > ($totalSteps / 2);
            default:
                return false;
        }
    }
}
