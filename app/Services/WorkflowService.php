<?php

namespace App\Services;

use App\Models\ApprovalWorkflow;
use App\Models\Jabatan;
use App\Models\Letter;
use App\Models\LetterApprover;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkflowDelegation;
use App\Notifications\LetterStatusNotification;
use App\Notifications\NewLetterNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkflowService
{
    /**
     * Start the approval workflow for a letter.
     *
     * @param  array  $customApprovers  Map of step_id => user_id
     * @param  array  $dynamicSteps     List of dynamic workflow steps from frontend
     */
    public function startWorkflow(Letter $letter, array $customApprovers = [], array $dynamicSteps = [])
    {
        Log::info('Starting Workflow', [
            'letter_type_id' => $letter->letter_type_id,
            'custom_approvers' => $customApprovers,
            'dynamic_steps_count' => count($dynamicSteps),
        ]);

        if (!empty($dynamicSteps)) {
            // Use Dynamic Steps provided by Frontend
            foreach ($dynamicSteps as $index => $stepData) {
                $this->createApproverFromDynamicStep($stepData, $letter, $index + 1, $customApprovers);
            }
        } else {
            // Automatic Hierarchical Workflow
            $creator = $letter->creator;
            $creatorStaff = $creator->staff;
            
            if (!$creatorStaff || !$creatorStaff->jabatan) {
                 // Fallback to static workflow if no staff/jabatan info
                $this->createStaticWorkflow($letter, $customApprovers);
            } else {
                $currentJabatan = $creatorStaff->jabatan;
                $order = 1;

                // 1. If creator is NOT a Ketua (e.g. Anggota, Staff), approval by their Unit's Ketua
                // Assuming 'Ketua' is identified by not having 'anggota' or 'staff' in name, OR by specific role logic.
                // Simplified: If user is not the head of the unit (check if there is a parent/child relation or just role),
                // For now, let's assume if the jabatan has a parent, and the user is 'anggota' (based on category or name), 
                // we need the head of THIS jabatan. 
                // BUT Jabatan model often has structure: Unit -> Ketua, Anggota. 
                // Let's assume Jabatan represents the SLOT. 
                // If I am 'Anggota Divisi A', my parent might be 'Ketua Divisi A' (if modeled that way) or 'Divisi A'.
                // Let's assume standard structure: User -> Staff -> Jabatan (e.g. "Anggota"). 
                // We need to find the "Ketua" of the SAME unit (parent? or sibling with role ketua?).
                
                // Based on User Request: "misal pengirimnya adalah anggota, maka harus di approve oleh ketua di unitnya"
                // This implies 'Anggota' and 'Ketua' are in the same 'Unit' (or Jabatan structure).
                
                // Let's look for a text-based match or relationship.
                // If my jabatan is 'Anggota ...', find 'Ketua ...' matching the suffix?
                // OR, relying on `parent_id` of the Jabatan.
                
                // Implementation Plan:
                // 1. Get current Jabatan.
                // 2. If it is 'Anggota' (check name/category), find the 'Ketua' of this unit. 
                //    (Maybe parent_id points to Ketua? or they share a parent?)
                //    Let's assume the hierarchy is: Ketua (Parent) -> Anggota (Child).
                //    If so, $currentJabatan->parent is the Ketua.
                
                if (stripos($currentJabatan->nama, 'Anggota') !== false || stripos($currentJabatan->nama, 'Staff') !== false) {
                    $ketuaUnit = $currentJabatan->parent;
                    if ($ketuaUnit) {
                         $this->createApproverForJabatan($ketuaUnit, $letter, $order++, $customApprovers);
                         $currentJabatan = $ketuaUnit; // Move up for next tier
                    }
                }
                
                // 3. Then approved by "Ketua tier yang lebih atas"
                // Continue up the chain
                if ($currentJabatan && $currentJabatan->parent) {
                    $higherTier = $currentJabatan->parent;
                    $this->createApproverForJabatan($higherTier, $letter, $order++, $customApprovers);
                }
            }
        }

        // Notify first approver(s)
        $this->notifyNextApprovers($letter);
    }

    private function createStaticWorkflow(Letter $letter, array $customApprovers)
    {
        $workflow = ApprovalWorkflow::where('letter_type_id', $letter->letter_type_id)->first();

        if (! $workflow) {
             // If no static workflow either, maybe just return or log? 
             // Ideally we shouldn't fail hard if we are making it dynamic, but for safety let's keep logic
             return;
        }

        $minOrder = $workflow->steps()->whereNull('parent_step_id')->min('order');
        $initialSteps = $workflow->steps()
            ->whereNull('parent_step_id')
            ->where('order', $minOrder)
            ->get();

        foreach ($initialSteps as $step) {
            $this->createApproversForStep($step, $letter, $customApprovers);
        }
    }

    private function createApproverForJabatan(Jabatan $jabatan, Letter $letter, $order, array $customApprovers) 
    {
        $approver_id = $jabatan->id; // Default to jabatan ID
        
        // Find user for this jabatan (active staff)
        $staff = Staff::where('jabatan_id', $jabatan->id)->where('status', 'active')->first();
        $userId = $staff ? $staff->user_id : null;

        LetterApprover::create([
            'letter_id' => $letter->id,
            'user_id' => $userId, // FIXED: User ID goes to user_id field
            'approver_id' => (string) $jabatan->id, // FIXED: Jabatan ID goes to approver_id field
            'approver_name' => $staff ? $staff->user->name : $jabatan->nama, // Fallback name
            'order' => $order,
            'status' => ($userId && $userId == $letter->created_by) ? 'approved' : 'pending',
            'approved_at' => ($userId && $userId == $letter->created_by) ? now() : null,
            'type' => 'sequential', // Default
        ]);
        
        // Note: The original createApproversForStep logic is more complex (ApprovalWorkflowStep model).
        // Here we are creating LetterApprover directly. 
        // We should ensure consistency with LetterApprover model fields.
    }

    /**
     * Create approver from dynamic step definition
     */
    private function createApproverFromDynamicStep($stepData, Letter $letter, $order, array $customApprovers)
    {
         // stepData structure matches WorkflowStep interface from frontend
         // approver_id holds the Jabatan ID if approver_type is 'jabatan'

         $userId = null;
         
         // If we have a custom approver override (map ID -> User ID)
         // Note: Frontend uses timestamp IDs for dynamic steps, so using that ID to look up selected user
         if (isset($customApprovers[$stepData['id']])) {
             $userId = $customApprovers[$stepData['id']];
         } elseif (isset($stepData['approver_user']['id'])) {
             // Fallback if embedded in step data
             $userId = $stepData['approver_user']['id'];
         }

         // If we still don't have a user ID but it's a jabatan type, try to resolve it
         if (!$userId && isset($stepData['approver_type']) && $stepData['approver_type'] === 'jabatan') {
             // Try to resolve generic staff
             $jabatanId = $stepData['approver_id'] ?? $stepData['jabatan_id'];
             if ($jabatanId) {
                  $staff = Staff::where('jabatan_id', $jabatanId)->where('status', 'active')->first();
                  $userId = $staff ? $staff->user_id : null;
             }
         }

         if ($userId) {
             LetterApprover::create([
                'letter_id' => $letter->id,
                'approver_id' => $stepData['approver_id'] ?? null, // Jabatan ID usually
                'user_id' => $userId,
                'order' => $order,
                'status' => ($userId == $letter->created_by) ? 'approved' : 'pending',
                'approved_at' => ($userId == $letter->created_by) ? now() : null,
            ]);
         } else {
             Log::warning("Could not resolve user for dynamic step", ['step' => $stepData]);
         }
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
                    'status' => ($userId && $userId == $letter->created_by) ? 'approved' : 'pending',
                    'approved_at' => ($userId && $userId == $letter->created_by) ? now() : null,
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
                'status' => ($userId && $userId == $letter->created_by) ? 'approved' : 'pending',
                'approved_at' => ($userId && $userId == $letter->created_by) ? now() : null,
            ]);
        }
    }

    /**
     * Resolve who is the actual user for a step.
     * Simplified to use Jabatan-only (no unit filtering)
     */
    private function resolveApproverUser($step, Letter $letter, array $customApprovers = [])
    {
        // Check for custom override first
        if (isset($customApprovers[$step->id])) {
            return $customApprovers[$step->id];
        }

        // Removed legacy 'user' type check as per requirement to use System Jabatan only.

        if ($step->approver_type === 'jabatan') {
            $jabatan = Jabatan::find($step->approver_id);

            if ($jabatan) {
                // Find any active staff with this jabatan
                // Simplified: no unit filtering needed
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
            ->where(function ($q) use ($actor) {
                $q->where('user_id', $actor->id)
                    ->orWhere('original_user_id', $actor->id);
            })
            ->orderBy('order', 'asc')
            ->first();

        if (! $currentApprover) {
            throw new \Exception('You are not the current approver.');
        }

        DB::transaction(function () use ($letter, $currentApprover, $action, $notes, $actor) {
            if ($action === 'approve') {
                $currentApprover->update([
                    'status' => 'approved',
                    'remarks' => $notes,
                    'approved_at' => now(),
                ]);

                // Check if this is part of a parallel group
                // For dynamic workflows, we might not have a database step definition ($step is null)
                // In that case, we rely on the LetterApprover table.
                
                $step = null;
                if ($currentApprover->approver_id && $letter->letterType->approvalWorkflows()->exists()) {
                     $step = $letter->letterType->approvalWorkflows()
                    ->first()
                    ->steps()
                    ->where('approver_id', $currentApprover->approver_id)
                    ->first();
                }

                if ($step && $step->isParallel() && $step->group) {
                    // Check if group is fully approved
                    if ($step->group->isFullyApproved($letter->id)) {
                        $this->moveToNextStep($letter, $step);
                    }
                } else {
                    // Sequential - move to next step
                    // If step is null (dynamic), we just check for the next approver in the list
                    if (!$step) {
                        $this->advanceDynamicWorkflow($letter, $currentApprover);
                    } else {
                        $this->moveToNextStep($letter, $step);
                    }
                }

            } elseif ($action === 'reject') {
                $currentApprover->update([
                    'status' => 'rejected',
                    'remarks' => $notes,
                    'approved_at' => now(),
                ]);
                $letter->update(['status' => 'rejected']);
                $letter->creator->notify(new LetterStatusNotification($letter, 'rejected', $actor->name));

            } elseif ($action === 'return') {
                $currentApprover->update([
                    'status' => 'returned',
                    'remarks' => $notes,
                    'approved_at' => now(),
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
        if (! $currentStep) {
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
        // For dynamic steps, we don't rely on database 'next step' logic if we are using custom approvers/dynamic workflow?
        // Wait, startWorkflow uses dynamic steps to create ALL approvers at once with orders.
        // So we just need to find the next approver with higher order in the existing LetterApprover table?
        // NO, the current logic relies on `ApprovalWorkflow` database model to find the next step definition.
        
        // CRITICAL BUG FOUND: For dynamic workflows (Smart Add), there are no `ApprovalWorkflow` steps in the database for the *new* steps.
        // The `startWorkflow` I patched creates ALL approvers (LetterApprover) upfront with correct orders.
        // So `moveToNextStep` should simply check if there are any *remaining* pending approvers in `letter_approvers` table?
        
        // Actually, `processApproval` updates the status of the current approver to 'approved'.
        // Then it calls `moveToNextStep`.
        
        // If we pre-created ALL `LetterApprover` records in `startWorkflow`, we don't need to "create" next steps.
        // We just need to notify the next one.
        // But `processApproval` calls `moveToNextStep`.
        
        // Let's look at `processApproval`:
        /*
            if ($action === 'approve') {
                $currentApprover->update(['status' => 'approved' ...]);
                // ...
                $step = ... (Finds database step definition)
                
                if ($step ...) { ... } 
                else {
                    $this->moveToNextStep($letter, $step);
                }
            }
        */
        
        // Issue: For dynamic steps, `$step` (from database) will be NULL because they are custom steps!
        // So `processApproval` might fail or behave unexpectedly if it can't find the step definition.
        // BUT, `LetterApprover` exists.
        
        // If `$step` is null, we should just check if there are more pending approvers.
        // If there are, notify them. If not, mark letter as approved.
        
        // Let's modify `processApproval` to handle null `$step` (dynamic workflow) gracefully.
        // And modify `moveToNextStep` (or create a new text) to simply "Advance Workflow".
        
        // REVISE STRATEGY: 
        // 1. In `processApproval`, if `$step` is null, it means it's a dynamic step (or end of standard workflow).
        // 2. We should check if there is a *next* approver (`LetterApprover`) with `order > current->order`.
        // 3. If yes, notify them. 
        // 4. If no, mark letter as `approved`.
        
        // Current `moveToNextStep` logic is "Find Next Definition -> Create Approver". 
        // This is wrong for dynamic workflows where approvers already exist.
        
        // Let's refactor `processApproval` and `moveToNextStep`.
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
     * Advance dynamic workflow by finding next existing approver
     */
    private function advanceDynamicWorkflow(Letter $letter, LetterApprover $currentApprover)
    {
        // Check if there are any pending approvers with higher order
        $nextApprover = $letter->approvers()
            ->where('order', '>', $currentApprover->order)
            ->where('status', 'pending')
            ->orderBy('order', 'asc')
            ->first();

        if ($nextApprover) {
            // Workflow continues
             $this->notifyNextApprovers($letter);
        } else {
            // All done
            $letter->update(['status' => 'approved']); // Set to approved, not archived
            $letter->creator->notify(new LetterStatusNotification($letter, 'approved', 'System'));
            
            // Also notify recipients?
            foreach ($letter->recipients as $recipient) {
                 if ($recipient->recipient_type === 'user') {
                     $user = User::find($recipient->recipient_id);
                     if ($user) $user->notify(new NewLetterNotification($letter, 'approved_recipient'));
                 }
            }
        }
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
