<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JabatanRole extends Model
{
    protected $fillable = ['nama', 'level', 'is_active', 'parent_id'];

    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
        'parent_id' => 'integer',
    ];

    public function parent()
    {
        return $this->belongsTo(JabatanRole::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(JabatanRole::class, 'parent_id');
    }

    public function scopeOrderByLevel($query)
    {
        return $query->orderBy('level', 'asc');
    }
}
