<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class evenements extends Model
{
    //
    protected $fillable = [
        'nom',
        'descriptions',
        'date_evenement',
        'type',
        'lieu',
        'photo'
    ];
}
