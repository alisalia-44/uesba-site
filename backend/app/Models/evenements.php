<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

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

    public function isPast():bool{
        return Carbon::parse($this->date_evenement)->isPast();
    }
    public function isNow(){
          return Carbon::parse($this->date_evenement)->isToday();
    }
}
