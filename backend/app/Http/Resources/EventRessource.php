<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventRessource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
                 'nom'=>$this->nom,
        'descriptions'=>$this->descriptions,
        'date_evenement'=>Carbon::parse($this->date_evenement)->locale('ALG'),
        'type'=>$this->type,
        'lieu'=>$this->lieu,
        'photo'=>url($this->photo),
        'estPasse'=>$this->isPast(),
        'enCours'=>$this->isNow()
        ];
    }
}
