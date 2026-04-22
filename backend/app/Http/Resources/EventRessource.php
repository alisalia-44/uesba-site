<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventRessource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nom'            => $this->nom,
            'descriptions'   => $this->descriptions,
            'date_evenement' => $this->date_evenement
                                    ? Carbon::parse($this->date_evenement)->toDateString()
                                    : null,
            'type'           => $this->type,
            'lieu'           => $this->lieu,
            'photo'          => $this->photo
                                    ? url('storage/' . $this->normalizePhotoPath($this->photo))
                                    : null,
        ];
    }

    private function normalizePhotoPath(string $photo): string
    {
        $photo = ltrim($photo, '/');

        return str_starts_with($photo, 'photo/')
            ? $photo
            : 'photo/' . $photo;
    }
}