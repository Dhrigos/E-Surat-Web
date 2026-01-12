<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mako extends Model
{
    protected $fillable = [
        'code',
        'city_code',
        'name',
    ];
}
