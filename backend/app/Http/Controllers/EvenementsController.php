<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventRessource;
use App\Models\evenements;
use Exception;
use Illuminate\Http\Request;
use App\Http\Services\FileUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EvenementsController extends Controller
{
    public function CreateEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom_event' => 'required|string',
            'description_event' => 'required|string',
            'date_event' => 'required|date',
            'type' => 'required|in:presentiel,En_ligne',
            'lieu' => 'required|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'champs invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $ev = DB::transaction(function () use ($request) {

                $fileUpLoad = null;

                if ($request->hasFile('photo')) {
                    $fileUpLoad = (new FileUpload())
                        ->UploadFile($request->file('photo'), 'events');
                }

                return evenements::create([
                    'nom' => $request->nom_event,
                    'descriptions' => $request->description_event,
                    'date_evenement' => $request->date_event,
                    'type' => $request->type,
                    'lieu' => $request->lieu,
                    'photo' => $fileUpLoad
                ]);
            });

            return response()->json([
                'message' => 'événement créé avec succès',
                'event' => new EventRessource($ev)
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function UpdateEvent(Request $request, $id = null)
    {
        if ($id) {
            $request->merge(['id' => $id]);
        }

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'nom_event' => 'nullable|string',
            'description_event' => 'nullable|string',
            'date_event' => 'nullable|date',
            'type' => 'nullable|in:presentiel,En_ligne',
            'lieu' => 'nullable|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'données invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $event = evenements::findOrFail($request->id);

            $fileUpLoad = $event->photo;

            if ($request->hasFile('photo')) {
                $fileUpLoad = (new FileUpload())
                    ->UploadFile($request->file('photo'), 'events');
            }

            $event->update([
                'nom' => $request->nom_event ?? $event->nom,
                'descriptions' => $request->description_event ?? $event->descriptions,
                'date_evenement' => $request->date_event ?? $event->date_evenement,
                'type' => $request->type ?? $event->type,
                'lieu' => $request->lieu ?? $event->lieu,
                'photo' => $fileUpLoad
            ]);

            return response()->json([
                'message' => 'événement modifié avec succès',
                'event' => new EventRessource($event)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function DeleteEvent(Request $request, $id = null)
    {
        $id = $id ?? $request->input('id');

        if (!$id) {
            return response()->json([
                'message' => 'id manquant'
            ], 400);
        }

        try {
            $event = evenements::findOrFail($id);

            // delete image if exists (optional but important)
            if ($event->photo) {
                (new FileUpload())->DeleteFile($event->photo);
            }

            $event->delete();

            return response()->json([
                'message' => 'événement supprimé avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function GetEvents()
    {
        $ev = evenements::orderBy('created_at', 'desc')->get();

        return response()->json([
            'evenement' => EventRessource::collection($ev)
        ], 200);
    }

    public function Latest()
    {
        try {
            $ev = evenements::where('date_evenement', '>=', now())
                ->orderBy('date_evenement', 'asc')
                ->limit(3)
                ->get();

            if ($ev->isEmpty()) {
                $ev = evenements::orderBy('created_at', 'desc')
                    ->limit(3)
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => EventRessource::collection($ev)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function DetailEvent(int $id)
    {
        $even = evenements::find($id);

        if (!$even) {
            return response()->json([
                'message' => 'événement non trouvé'
            ], 404);
        }

        return response()->json([
            'event' => new EventRessource($even)
        ], 200);
    }
}