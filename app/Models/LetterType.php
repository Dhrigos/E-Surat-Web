<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'description'];

    public function approvalWorkflows()
    {
        return $this->hasMany(ApprovalWorkflow::class);
    }
}
