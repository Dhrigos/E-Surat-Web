<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JabatanRole extends Model
{
    protected $fillable = ['nama', 'level', 'is_active'];

    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeOrderByLevel($query)
    {
        return $query->orderBy('level', 'asc');
    }
}
