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
        'nomor_registrasi',
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
        'warna_mata',
        'warna_rambut',
        'bentuk_rambut',
        'alamat_domisili_lengkap',
        'birthplace_province_id',
        'province_id',
        'city_id',
        'district_id',
        'village_id',
        'jalan',
        'domisili_jalan',
        'domisili_province_id',
        'domisili_city_id',
        'domisili_district_id',
        'domisili_village_id',
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
        'ukuran_kaos_pdl',
        'ukuran_seragam_tactical',
        'ukuran_baju_tidur',
        'ukuran_training_pack',
        'ukuran_baju_renang',
        'ukuran_sepatu_tactical',
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

    public function domisiliProvinsi(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Province::class, 'domisili_province_id', 'code');
    }

    public function domisiliKabupaten(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\City::class, 'domisili_city_id', 'code');
    }

    public function domisiliKecamatan(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\District::class, 'domisili_district_id', 'code');
    }

    public function domisiliDesa(): BelongsTo
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Village::class, 'domisili_village_id', 'code');
    }

    /**
     * Generate unique registration number
     * Format: [matra][golongan][4digit]-[gender][3digit]-[ddmmyyyy]
     * Example: AD11234-L567-26012026
     */
    public static function generateNomorRegistrasi(string $matra, int $golonganId, string $jenisKelamin): string
    {
        // Get gender code (L or P)
        $genderCode = strtoupper(substr($jenisKelamin, 0, 1)); // L or P
        
        // Get current date in ddmmyyyy format
        $dateCode = date('dmY');
        
        // Generate random numbers
        $randomPart1 = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $randomPart2 = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        
        // Build registration number
        $nomorRegistrasi = strtoupper($matra) . $golonganId . $randomPart1 . '-' . $genderCode . $randomPart2 . '-' . $dateCode;
        
        // Check if already exists, regenerate if needed
        $attempts = 0;
        while (self::where('nomor_registrasi', $nomorRegistrasi)->exists() && $attempts < 10) {
            $randomPart1 = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $randomPart2 = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
            $nomorRegistrasi = strtoupper($matra) . $golonganId . $randomPart1 . '-' . $genderCode . $randomPart2 . '-' . $dateCode;
            $attempts++;
        }
        
        return $nomorRegistrasi;
    }
}
