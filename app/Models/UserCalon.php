<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCalon extends Model
{
    use HasFactory;

    protected $table = 'user_calon';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'matra',
        'golongan_id',
        'pangkat_id',
        'nik',
        'nomor_kk',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'suku_id',
        'bangsa_id',
        'agama_id',
        'status_pernikahan_id',
        'nama_ibu_kandung',
        'golongan_darah_id',
        'tinggi_badan',
        'berat_badan',
        'warna_kulit',
        'warna_rambut',
        'bentuk_rambut',
        'alamat_domisili_lengkap',
        'birthplace_province_id',
        'province_id',
        'city_id',
        'district_id',
        'village_id',
        'jalan',
        'is_bekerja',
        'pekerjaan_id',
        'nama_perusahaan',
        'nama_profesi',
        'foto_profil',
        'doc_surat_lamaran',
        'doc_ktp',
        'doc_kk',
        'doc_sk_lurah',
        'doc_skck',
        'doc_ijazah',
        'doc_sk_sehat',
        'doc_drh',
        'doc_latsarmil',
        'doc_izin_instansi',
        'doc_izin_ortu',
        'ukuran_pakaian',
        'ukuran_sepatu',
        'ukuran_topi',
        'ukuran_kaos_olahraga',
        'ukuran_sepatu_olahraga',
        'pendidikan_id',
        'nama_sekolah',
        'nama_prodi',
        'nilai_akhir',
        'status_lulus',
        'tanda_tangan',
        'scan_ktp',
        'scan_selfie',
        'ekyc_score',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function golongan(): BelongsTo
    {
        return $this->belongsTo(Golongan::class);
    }

    public function pangkat(): BelongsTo
    {
        return $this->belongsTo(Pangkat::class);
    }

    public function suku(): BelongsTo
    {
        return $this->belongsTo(Suku::class);
    }

    public function bangsa(): BelongsTo
    {
        return $this->belongsTo(Bangsa::class);
    }

    public function agama(): BelongsTo
    {
        return $this->belongsTo(Agama::class);
    }

    public function statusPernikahan(): BelongsTo
    {
        return $this->belongsTo(Pernikahan::class, 'status_pernikahan_id');
    }

    public function golonganDarah(): BelongsTo
    {
        return $this->belongsTo(Goldar::class, 'golongan_darah_id');
    }

    public function birthplace(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\City::class, 'tempat_lahir', 'code');
    }

    public function pendidikan(): BelongsTo
    {
        return $this->belongsTo(Pendidikan::class);
    }

    public function pekerjaan(): BelongsTo
    {
        return $this->belongsTo(Pekerjaan::class);
    }

    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Province::class, 'province_id', 'code');
    }

    public function kabupaten(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\City::class, 'city_id', 'code');
    }

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\District::class, 'district_id', 'code');
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Village::class, 'village_id', 'code');
    }
}
