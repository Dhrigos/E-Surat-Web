<?php

namespace App\Services;

use App\Models\Letter;
use App\Models\LetterApprover;
use App\Models\ApprovalWorkflow;
use App\Models\Jabatan;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkflowDelegation;
use App\Notifications\NewLetterNotification;
use App\Notifications\LetterStatusNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkflowService
{
    /**
     * Start the approval workflow for a letter.
     * @param Letter $letter
     * @param array $customApprovers Map of step_id => user_id
     */
    public function startWorkflow(Letter $letter, array $customApprovers = [])
    {
        Log::info('Starting Workflow', [
            'letter_type_id' => $letter->letter_type_id,
            'unit_id' => $letter->unit_id,
            'custom_approvers' => $customApprovers,
        ]);

        $workflow = ApprovalWorkflow::where('letter_type_id', $letter->letter_type_id)
            ->where(function($q) use ($letter) {
                $q->where('unit_id', $letter->unit_id)
                  ->orWhereNull('unit_id');
            })
            ->orderBy('unit_id', 'desc')
            ->first();

        if (!$workflow) {
            Log::error('No workflow found', [
                'letter_type_id' => $letter->letter_type_id,
                'unit_id' => $letter->unit_id,
            ]);
            throw new \Exception("No approval workflow found for this letter type.");
        }

        // Get root steps (steps without parent)
        $rootSteps = $workflow->steps()->whereNull('parent_step_id')->orderBy('order')->get();

        foreach ($rootSteps as $step) {
            $this->createApproversForStep($step, $letter, $customApprovers);
        }

        // Notify first approver(s)
        $this->notifyNextApprovers($letter);
    }

    /**
     * Create approver entries for a step (handles parallel groups)
     */
    private function createApproversForStep($step, Letter $letter, array $customApprovers = [])
    {
        if ($step->isParallel() && $step->group) {
            // Parallel approval - create approvers for all steps in group
            foreach ($step->group->steps as $parallelStep) {
                $userId = $this->resolveApproverUser($parallelStep, $letter, $customApprovers);
                
                LetterApprover::create([
                    'letter_id' => $letter->id,
                    'approver_id' => $parallelStep->approver_id,
                    'user_id' => $userId,
                    'order' => $parallelStep->order,
                    'status' => 'pending',
                ]);
            }
        } else {
            // Sequential or conditional - create single approver
            $userId = $this->resolveApproverUser($step, $letter, $customApprovers);
            
            LetterApprover::create([
                'letter_id' => $letter->id,
                'approver_id' => $step->approver_id,
                'user_id' => $userId,
                'order' => $step->order,
                'status' => 'pending',
            ]);
        }
    }

    /**
     * Resolve who is the actual user for a step.
     */
    private function resolveApproverUser($step, Letter $letter, array $customApprovers = [])
    {
        // Check for custom override first
        if (isset($customApprovers[$step->id])) {
            return $customApprovers[$step->id];
        }

        if ($step->approver_type === 'user') {
            return $step->approver_id;
        }

        if ($step->approver_type === 'jabatan') {
            $jabatan = Jabatan::find($step->approver_id);
            
            if ($jabatan) {
                $creatorUnitId = $letter->unit_id ?? $letter->creator->unit_id ?? null;

                if ($creatorUnitId) {
                    $staff = Staff::where('jabatan_id', $jabatan->id)
                        ->where('unit_kerja_id', $creatorUnitId)
                        ->where('status', 'active')
                        ->first();
                    
                    if ($staff) return $staff->user_id;
                }

                $staff = Staff::where('jabatan_id', $jabatan->id)
                    ->where('status', 'active')
                    ->first();
                    
                return $staff ? $staff->user_id : null;
            }
        }

        return null;
    }

    /**
     * Process an approval action.
     */
    public function processApproval(Letter $letter, User $actor, string $action, ?string $notes = null)
    {
        $currentApprover = $letter->approvers()
            ->where('status', 'pending')
            ->where(function($q) use ($actor) {
                $q->where('user_id', $actor->id)
                  ->orWhere('original_user_id', $actor->id);
            })
            ->orderBy('order', 'asc')
            ->first();

        if (!$currentApprover) {
            throw new \Exception("You are not the current approver.");
        }

        DB::transaction(function () use ($letter, $currentApprover, $action, $notes, $actor) {
            if ($action === 'approve') {
                $currentApprover->update([
                    'status' => 'approved',
                    'remarks' => $notes,
                    'approved_at' => now(),
                ]);

                // Check if this is part of a parallel group
                $step = $letter->letterType->approvalWorkflows()
                    ->first()
                    ->steps()
                    ->where('approver_id', $currentApprover->approver_id)
                    ->first();

                if ($step && $step->isParallel() && $step->group) {
                    // Check if group is fully approved
                    if ($step->group->isFullyApproved($letter->id)) {
                        $this->moveToNextStep($letter, $step);
                    }
                } else {
                    // Sequential - move to next step
                    $this->moveToNextStep($letter, $step);
                }

            } elseif ($action === 'reject') {
                $currentApprover->update([
                    'status' => 'rejected',
                    'remarks' => $notes,
                ]);
                $letter->update(['status' => 'rejected']);
                $letter->creator->notify(new LetterStatusNotification($letter, 'rejected', $actor->name));
                
            } elseif ($action === 'return') {
                $currentApprover->update([
                    'status' => 'returned',
                    'remarks' => $notes,
                ]);
                $letter->update(['status' => 'revision']);
                $letter->creator->notify(new LetterStatusNotification($letter, 'returned', $actor->name));
            }
        });
    }

    /**
     * Move to the next step in the workflow
     */
    private function moveToNextStep(Letter $letter, $currentStep)
    {
        if (!$currentStep) {
            // No more steps, mark as approved
            $letter->update(['status' => 'approved']);
            $letter->creator->notify(new LetterStatusNotification($letter, 'approved', 'System'));
            return;
        }

        // Get child steps (for conditional routing)
        $childSteps = $currentStep->childSteps;

        if ($childSteps->count() > 0) {
            // Conditional routing - evaluate conditions
            foreach ($childSteps as $childStep) {
                if ($childStep->evaluateCondition($letter)) {
                    $this->createApproversForStep($childStep, $letter);
                    $this->notifyNextApprovers($letter);
                    return;
                }
            }
        }

        // No child steps or no condition met - get next sequential step
        $nextStep = $letter->letterType->approvalWorkflows()
            ->first()
            ->steps()
            ->where('order', '>', $currentStep->order)
            ->whereNull('parent_step_id') // Only root steps
            ->orderBy('order', 'asc')
            ->first();

        if ($nextStep) {
            $this->createApproversForStep($nextStep, $letter);
            $this->notifyNextApprovers($letter);
        } else {
            // All done
            $letter->update(['status' => 'approved']);
            $letter->creator->notify(new LetterStatusNotification($letter, 'approved', 'System'));
        }
    }

    /**
     * Notify next approver(s)
     */
    private function notifyNextApprovers(Letter $letter)
    {
        $approvers = $letter->approvers()
            ->where('status', 'pending')
            ->orderBy('order', 'asc')
            ->get();
        
        foreach ($approvers as $approver) {
            if ($approver->user_id) {
                $user = User::find($approver->user_id);
                if ($user) {
                    $user->notify(new NewLetterNotification($letter, 'approval_needed'));
                }
            }
        }
    }

    /**
     * Delegate approval to another user
     */
    public function delegateApproval(LetterApprover $approver, User $delegateTo, string $reason, $startDate = null, $endDate = null)
    {
        DB::transaction(function () use ($approver, $delegateTo, $reason, $startDate, $endDate) {
            // Create delegation record
            WorkflowDelegation::create([
                'letter_approver_id' => $approver->id,
                'delegated_from_user_id' => $approver->user_id,
                'delegated_to_user_id' => $delegateTo->id,
                'reason' => $reason,
                'start_date' => $startDate ?? now(),
                'end_date' => $endDate,
                'is_active' => true,
            ]);

            // Update approver
            $approver->update([
                'original_user_id' => $approver->user_id,
                'user_id' => $delegateTo->id,
                'is_delegated' => true,
            ]);

            // Notify delegated user
            $delegateTo->notify(new NewLetterNotification($approver->letter, 'delegated_approval'));
        });
    }

    /**
     * Revoke delegation
     */
    public function revokeDelegation(WorkflowDelegation $delegation)
    {
        DB::transaction(function () use ($delegation) {
            $delegation->update(['is_active' => false]);

            $approver = $delegation->letterApprover;
            $approver->update([
                'user_id' => $approver->original_user_id,
                'original_user_id' => null,
                'is_delegated' => false,
            ]);
        });
    }
}
