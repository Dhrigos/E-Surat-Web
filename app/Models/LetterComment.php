<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LetterComment extends Model
{
    protected $fillable = ['letter_id', 'user_id', 'comment'];

    public function letter()
    {
        return $this->belongsTo(Letter::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
