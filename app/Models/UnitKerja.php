<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitKerja extends Model
{
    use HasFactory;

    protected $table = 'unit_kerja';

    protected $fillable = [
        'nama',
        'kode',
        'parent_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the parent unit kerja.
     */
    public function parent()
    {
        return $this->belongsTo(UnitKerja::class, 'parent_id');
    }

    /**
     * Get the children unit kerja.
     */
    public function children()
    {
        return $this->hasMany(UnitKerja::class, 'parent_id');
    }

    /**
     * Get the jabatan in this unit kerja.
     */
    public function jabatans()
    {
        return $this->belongsToMany(Jabatan::class, 'jabatan_unit_kerja')
            ->withTimestamps()
            ->withPivot('is_active');
    }

    /**
     * Scope a query to only include active unit kerja.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root unit kerja (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}
