<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusKeanggotaan extends Model
{
    use HasFactory;

    protected $fillable = ['nama', 'keterangan'];

    /**
     * Get the jabatan that have this status keanggotaan.
     */
    public function jabatans()
    {
        return $this->belongsToMany(Jabatan::class, 'jabatan_status_keanggotaan')
            ->withTimestamps()
            ->withPivot('is_active');
    }

    /**
     * Get the pangkat available for this status keanggotaan.
     */
    public function pangkats()
    {
        return $this->belongsToMany(Pangkat::class, 'status_keanggotaan_pangkat')
            ->withTimestamps()
            ->withPivot('is_active', 'min_tingkat', 'max_tingkat');
    }
}
