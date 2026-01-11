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
        'kategori',
        'level',
        'parent_id',
        'keterangan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
    ];

    public function parent()
    {
        return $this->belongsTo(Jabatan::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Jabatan::class, 'parent_id');
    }

    const KATEGORI_STRUKTURAL = 'struktural';

    const KATEGORI_FUNGSIONAL = 'fungsional';

    const KATEGORI_ANGGOTA = 'anggota';

    public function scopeStruktural($query)
    {
        return $query->where('kategori', self::KATEGORI_STRUKTURAL);
    }

    public function scopeFungsional($query)
    {
        return $query->where('kategori', self::KATEGORI_FUNGSIONAL);
    }

    public function scopeAnggota($query)
    {
        return $query->where('kategori', self::KATEGORI_ANGGOTA);
    }

    /**
     * Scope a query to only include active jabatan.
     */
    /**
     * Scope a query to only include active jabatan.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected $appends = ['nama_lengkap'];

    public function getNamaLengkapAttribute()
    {
        $genericNames = [
            'KETUA',
            'WAKIL KETUA',
            'ANGGOTA',
            'STAFF KHUSUS',
            'STAFF AHLI',
            // Add other generic roles if needed
        ];

        // Check if current name matches any generic name (case insensitive just in case, though we force upper)
        if (in_array(strtoupper($this->nama), $genericNames) && $this->parent) {
            return $this->nama.' '.$this->parent->nama;
        }

        return $this->nama;
    }
}
