<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Golongan extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = ['nama', 'keterangan'];

    public function pangkats()
    {
        return $this->hasMany(Pangkat::class);
    }
}
