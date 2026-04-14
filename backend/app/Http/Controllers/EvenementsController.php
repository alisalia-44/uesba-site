<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventRessource;
use ErrorException;
use App\Models\evenements;
use Exception;
use Illuminate\Http\Request;
use App\Http\Services\FileUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EvenementsController extends Controller
{
    //
public function CreateEvent(Request $request)
{
    $validator = Validator::make($request->all(), [
        'nom_event' => 'required|string',
        'description_event' => 'required|string',
        'date_event' => 'required|date',
        'type' => 'required|in:presentiel,En_ligne',
        'lieu' => 'required|string',
        'photo' => 'nullable|file'
    ]);

    if ($validator->fails()) {
            return response()->json([
                'message' => 'les champs ne sont pas correctement renseigne',
                'errors' => $validator->errors(),
                'input' => $request->all()
            ], 400);
    }

    DB::beginTransaction();

    try {

        $fileUpLoad = null;

        if ($request->hasFile('photo')) {
            $fileUpLoad = (new FileUpload())->UploadFile($request->file('photo'), 'photo');
        }

        $ev = evenements::create([
            'nom' => $request->nom_event,
            'descriptions' => $request->description_event,
            'date_evenement' => $request->date_event,
            'type' => $request->type,
            'lieu' => $request->lieu,
            'photo' => $fileUpLoad
        ]);

        DB::commit();

        return response()->json([
            'message' => 'evenement creer avec succes',
            'event' => new EventRessource($ev)
        ], 201);

    } catch (Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
public function UpdateEvent(Request $request, $id = null)
{
    // If id provided via route, merge into request for validation/processing
    if ($id) $request->merge(['id' => $id]);
    $validator = Validator::make($request->all(), [
        'id' => 'required',
        'nom_event' => 'nullable|string',
        'description_event' => 'nullable|string',
        'date_event' => 'nullable|date',
        'type' => 'nullable|in:presentiel,En_ligne',
        'lieu' => 'nullable|string',
        'photo' => 'nullable|file'
    ]);

    if ($validator->fails()) {
            return response()->json([
                'message' => 'les champs ne sont pas correctement',
                'errors' => $validator->errors(),
                'input' => $request->all()
            ], 400);
    }

    DB::beginTransaction();

    try {

        $event = evenements::findOrFail($request->id);

        $fileUpLoad = $event->photo;

        if ($request->hasFile('photo')) {
            $fileUpLoad = (new FileUpload())->UploadFile($request->file('photo'), 'photo');
        }

        $event->update([
            'nom' => $request->nom_event ?? $event->nom,
            'descriptions' => $request->description_event ?? $event->descriptions,
            'date_evenement' => $request->date_event ?? $event->date_evenement,
            'type' => $request->type ?? $event->type,
            'lieu' => $request->lieu ?? $event->lieu,
            'photo' => $fileUpLoad
        ]);

        DB::commit();

        return response()->json([
            'message' => 'evenement modifie avec succes',
            'event' => new EventRessource($event)
        ], 200);

    } catch (Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
public function DeleteEvent(Request $request, $id = null)
{
    DB::beginTransaction();

    try {

        // support both route parameter and JSON body { id }
        $id = $id ?? $request->input('id');
        if (!$id) {
            return response()->json([ 'message' => 'id manquant' ], 400);
        }

        $event = evenements::findOrFail($id);

        $event->delete();

        DB::commit();

        return response()->json([
            'message' => 'evenement supprimer avec succes'
        ], 200);

    } catch (Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}

    public function GetEvents()
    {
        // Return all events ordered by newest first so public site immediately sees newly created events
        $ev = evenements::orderBy('created_at', 'desc')->get();
        return response()->json([
            'evenement' => EventRessource::collection($ev)
        ]);
    }
    
    // Return the 3 upcoming events ordered by date
    public function Latest()
    {
        try {
            $now = now();
            $ev = evenements::where('date_evenement', '>=', $now)
                ->orderBy('date_evenement', 'asc')
                ->limit(3)
                ->get();
            // fall back to most recent created if no upcoming
            if ($ev->count() === 0) {
                $ev = evenements::orderBy('created_at', 'desc')->limit(3)->get();
            }
            return response()->json(['success' => true, 'data' => EventRessource::collection($ev)]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    public function DetailEvent( int $id)
    {
        $even = evenements::find($id);
        if (!$even){
            return response()->json([
                'message'=>'evenement non trouve' 
            ],404);
        }

        // Return a single event resource
        return response()->json([
            'event' => new EventRessource($even)
        ], 200);
    }
}
