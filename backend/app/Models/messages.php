<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class messages extends Model
{
    protected $fllable = [
        'email',
        'message',
        'nom_complet'
    ];

    public function GetNomCompletAttribute($value)
    {
        return ucfirst($value);
    }
}
