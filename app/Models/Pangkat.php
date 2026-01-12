<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pangkat extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $table = 'pangkat';

    protected $fillable = ['nama', 'kode', 'golongan_id', 'tingkat'];

    public function golongan()
    {
        return $this->belongsTo(Golongan::class, 'golongan_id');
    }
}
