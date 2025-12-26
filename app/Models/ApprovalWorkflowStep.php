<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalWorkflowStep extends Model
{
    protected $fillable = [
        'workflow_id',
        'order',
        'approver_type',
        'approver_id',
        'step_type',
        'group_id',
        'parent_step_id',
        'condition_field',
        'condition_operator',
        'condition_value',
        'is_required',
        'timeout_hours',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_required' => 'boolean',
        'timeout_hours' => 'integer',
    ];

    public function workflow()
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function group()
    {
        return $this->belongsTo(WorkflowStepGroup::class, 'group_id');
    }

    public function parentStep()
    {
        return $this->belongsTo(ApprovalWorkflowStep::class, 'parent_step_id');
    }

    public function childSteps()
    {
        return $this->hasMany(ApprovalWorkflowStep::class, 'parent_step_id');
    }

    public function letterApprovers()
    {
        return $this->hasMany(LetterApprover::class, 'approver_id', 'approver_id');
    }

    public function approverUser()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function approverJabatan()
    {
        return $this->belongsTo(Jabatan::class, 'approver_id');
    }

    /**
     * Check if this step's condition is met for a given letter
     */
    public function evaluateCondition($letter)
    {
        if (!$this->condition_field) {
            return true; // No condition means always true
        }

        $value = $letter->{$this->condition_field};

        switch ($this->condition_operator) {
            case '=':
                return $value == $this->condition_value;
            case '!=':
                return $value != $this->condition_value;
            case '>':
                return $value > $this->condition_value;
            case '<':
                return $value < $this->condition_value;
            case '>=':
                return $value >= $this->condition_value;
            case '<=':
                return $value <= $this->condition_value;
            case 'in':
                $values = json_decode($this->condition_value, true);
                return in_array($value, $values);
            case 'not_in':
                $values = json_decode($this->condition_value, true);
                return !in_array($value, $values);
            default:
                return true;
        }
    }

    /**
     * Check if this is a parallel approval step
     */
    public function isParallel()
    {
        return $this->step_type === 'parallel';
    }

    /**
     * Check if this is a conditional step
     */
    public function isConditional()
    {
        return $this->step_type === 'conditional';
    }

    /**
     * Check if this is a sequential step
     */
    public function isSequential()
    {
        return $this->step_type === 'sequential';
    }
}
