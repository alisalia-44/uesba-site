<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;


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
            'id' => $this->id,
            'nom' => $this->nom,
            'descriptions' => $this->descriptions,
            'date_evenement' => Carbon::parse($this->date_evenement)->locale('ALG'),
            'type' => $this->type,
            'lieu' => $this->lieu,
            'photo' => $this->photo ? 'http://localhost:8000/storage/photo/'.$this->photo : null,
            'estPasse' => $this->isPast(),
            'enCours' => $this->isNow()
        ];
    }
}
