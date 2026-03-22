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
        // Build photo URL safely (avoid inline closure in array to ensure compatibility)
        $photoUrl = null;
        if ($this->photo) {
            $p = $this->photo;
            if (strpos($p, '/') === false) {
                $p = 'photo/' . $p;
            }
            $photoUrl = url('storage/' . ltrim($p, '/'));
        }

        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'descriptions' => $this->descriptions,
            // return ISO date string
            'date_evenement' => $this->date_evenement ? Carbon::parse($this->date_evenement)->toDateString() : null,
            'type' => $this->type,
            'lieu' => $this->lieu,
'photo' => $this->photo ? 'http://localhost:8000/storage/photo/'.$this->photo : null,
        ];
    }
}
