<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class actualites extends Model
{
   
//

protected $fillable = [
'nom',
'descriptions',
'photo'
];
       

public function scopeLatest_activity(Builder $query){
    $query->where('');
}
}



