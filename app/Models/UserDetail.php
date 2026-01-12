<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDetail extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'nia_nrp',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat_domisili_lengkap',
        'foto_profil',
        'pangkat_id',
        'jabatan_id',
        'jabatan_role_id',
        'scan_ktp',
        'scan_kta',
        'scan_sk',
        'tanda_tangan',
        'tanggal_pengangkatan',
        'nomor_sk',
        'nomor_kta',
        'province_id',
        'city_id',
        'district_id',
        'village_id',
        'jalan',
        'scan_selfie',
        'ekyc_score',
        'office_province_id',
        'office_city_id',
        'mako_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    public function jabatanRole(): BelongsTo
    {
        return $this->belongsTo(JabatanRole::class);
    }

    public function pangkat(): BelongsTo
    {
        return $this->belongsTo(Pangkat::class);
    }
}
