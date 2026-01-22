<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOrganisasi extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'nama_organisasi',
        'posisi',
        'tanggal_mulai',
        'tanggal_berakhir',
        'informasi_tambahan',
        'is_active',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_berakhir' => 'date',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
