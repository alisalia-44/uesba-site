<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class evenements extends Model
{
    protected $table = 'evenements';

    protected $fillable = [
        'nom',
        'descriptions',
        'date_evenement',
        'type',
        'lieu',
        'photo'
    ];

    /**
     * Événement passé
     */
    public function isPast(): bool
    {
        return Carbon::parse($this->date_evenement)->isPast();
    }

    /**
     * Événement aujourd’hui
     */
    public function isToday(): bool
    {
        return Carbon::parse($this->date_evenement)->isToday();
    }

    /**
     * Événement futur
     */
    public function isUpcoming(): bool
    {
        return Carbon::parse($this->date_evenement)->isFuture();
    }

    /**
     * Statut global (utile frontend)
     */
    public function getStatusAttribute(): string
    {
        if ($this->isPast()) return 'past';
        if ($this->isToday()) return 'today';
        return 'upcoming';
    }
}