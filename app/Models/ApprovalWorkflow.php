<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalWorkflow extends Model
{
    protected $fillable = ['name', 'letter_type_id', 'unit_id', 'description'];

    public function letterType()
    {
        return $this->belongsTo(LetterType::class);
    }

    public function steps()
    {
        return $this->hasMany(ApprovalWorkflowStep::class, 'workflow_id')->orderBy('order');
    }

    public function groups()
    {
        return $this->hasMany(WorkflowStepGroup::class, 'workflow_id')->orderBy('group_order');
    }

    public function unit()
    {
        return $this->belongsTo(UnitKerja::class, 'unit_id');
    }

    /**
     * Get root steps (steps without parent)
     */
    public function rootSteps()
    {
        return $this->steps()->whereNull('parent_step_id');
    }

    /**
     * Get sequential steps only
     */
    public function sequentialSteps()
    {
        return $this->steps()->where('step_type', 'sequential');
    }

    /**
     * Get parallel steps (grouped)
     */
    public function parallelSteps()
    {
        return $this->steps()->where('step_type', 'parallel');
    }

    /**
     * Get conditional steps
     */
    public function conditionalSteps()
    {
        return $this->steps()->where('step_type', 'conditional');
    }
}
