<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pangkat extends Model
{
    use HasFactory;

    protected $table = 'pangkat';

    protected $fillable = [
        'nama',
        'kode',
        'tingkat',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tingkat' => 'integer',
    ];

    /**
     * Scope a query to only include active pangkat.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the status keanggotaan that can have this pangkat.
     */
    public function statusKeanggotaans()
    {
        return $this->belongsToMany(StatusKeanggotaan::class, 'status_keanggotaan_pangkat')
            ->withTimestamps()
            ->withPivot('is_active', 'min_tingkat', 'max_tingkat');
    }

    /**
     * Scope a query to order by tingkat.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('tingkat', 'asc');
    }
}
