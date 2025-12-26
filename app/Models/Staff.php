<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'user_id',
        'manager_id',
        'name',
        'email',
        'phone',
        'nip',
        'nia',
        'pangkat_id',
        'jabatan_id',
        'unit_kerja_id',
        'status_keanggotaan_id',
        'tanggal_masuk',
        'role',
        'status',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
    ];

    /**
     * Get the manager who manages this staff.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the user account linked to this staff.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the pangkat of this staff.
     */
    public function pangkat()
    {
        return $this->belongsTo(Pangkat::class);
    }

    /**
     * Get the jabatan of this staff.
     */
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class);
    }

    /**
     * Get the unit kerja of this staff.
     */
    public function unitKerja()
    {
        return $this->belongsTo(UnitKerja::class);
    }

    /**
     * Get the status keanggotaan of this staff.
     */
    public function statusKeanggotaan()
    {
        return $this->belongsTo(StatusKeanggotaan::class);
    }



    /**
     * Scope a query to only include active staff.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include staff managed by a specific manager.
     */
    public function scopeByManager($query, $managerId)
    {
        return $query->where('manager_id', $managerId);
    }
}
