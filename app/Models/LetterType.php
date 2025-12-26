<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class LetterType extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'code', 'description', 'template_id'];

    public function approvalWorkflows()
    {
        return $this->hasMany(ApprovalWorkflow::class);
    }

    public function template()
    {
        return $this->belongsTo(LetterTemplate::class);
    }
}
