<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    use HasFactory;

    protected $table = 'jabatan';

    protected $fillable = [
        'nama',
        'keterangan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the unit kerja that have this jabatan.
     */
    public function unitKerjas()
    {
        return $this->belongsToMany(UnitKerja::class, 'jabatan_unit_kerja')
            ->withTimestamps()
            ->withPivot('is_active');
    }

    /**
     * Get the status keanggotaan for this jabatan.
     */
    public function statusKeanggotaans()
    {
        return $this->belongsToMany(StatusKeanggotaan::class, 'jabatan_status_keanggotaan')
            ->withTimestamps()
            ->withPivot('is_active');
    }

    /**
     * Scope a query to only include active jabatan.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
