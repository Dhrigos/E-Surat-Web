<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Disposition extends Model
{
    use LogsActivity;
    protected $fillable = [
        'letter_id',
        'sender_id',
        'recipient_id',
        'instruction',
        'note',
        'due_date',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function letter()
    {
        return $this->belongsTo(Letter::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
