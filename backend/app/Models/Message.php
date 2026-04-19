<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';

    protected $fillable = [
        'nom_complet',
        'email',
        'message'
    ];

    // Provide a convenience accessor for name
    public function getNameAttribute()
    {
        return $this->nom_complet;
    }
}
