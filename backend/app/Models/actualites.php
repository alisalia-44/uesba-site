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
    'photo',
    'categorie'
];

/**
 * Scope to order by newest first
 */
public function scopeLatestActivity(Builder $query)
{
    return $query->orderBy('created_at', 'desc');
}
}



