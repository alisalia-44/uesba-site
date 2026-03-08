<?php

namespace App\Http\Controllers;

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
            'message' => 'les champs ne sont pas correctement renseigne'
        ], 400);
    }

    DB::beginTransaction();

    try {

        $fileUpLoad = null;

        if ($request->hasFile('photo')) {
            $fileUpLoad = (new FileUpload())->UploadFile($request->file('photo'), 'photo');
        }

        evenements::create([
            'nom' => $request->nom_event,
            'descriptions' => $request->description_event,
            'date_evenement' => $request->date_event,
            'type' => ucfirst($request->type),
            'lieu' => $request->lieu,
            'photo' => $fileUpLoad
        ]);

        DB::commit();

        return response()->json([
            'message' => 'evenement creer avec succes'
        ], 201);

    } catch (Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
public function UpdateEvent(Request $request)
{
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
            'message' => 'les champs ne sont pas correctement'
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
            'type' => $request->type ? ucfirst($request->type) : $event->type,
            'lieu' => $request->lieu ?? $event->lieu,
            'photo' => $fileUpLoad
        ]);

        DB::commit();

        return response()->json([
            'message' => 'evenement modifie avec succes'
        ], 200);

    } catch (Exception $e) {

        DB::rollBack();

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
public function DeleteEvent(int $id)
{
    DB::beginTransaction();

    try {

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
        $ev =  evenements::paginate(10);
        return response()->json([
            'evenement'=>$ev
        ]);
    }
    public function DetailEvent( int $id)
    {
        $even = evenements::find($id);
        if (!$even){
            return response()->json([
                'message'=>'evenement non trouve' 
            ],404);
        }

        return response()->json([
            'event'=>$even
        ]);
    }
}
