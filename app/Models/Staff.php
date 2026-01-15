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
        'jabatan_id',
        'pangkat_id',
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
     * Get the jabatan of this staff.
     */
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class);
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
