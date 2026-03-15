<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Models\actualites;
use App\Http\Services\FileUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ActualitesController extends Controller
{

    public function CreateActualite(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'descriptions' => 'required|string',
            'photo' => 'nullable|file',
            'categorie'=>'required|in:annonce,academique,social'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'les champs ne sont pas correctement renseignes'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $fileUpload = null;

            if ($request->hasFile('photo')) {
                $fileUpload = (new FileUpload())->UploadFile($request->file('photo'), 'actualites');
            }

            actualites::create([
                'nom' => $request->nom,
                'descriptions' => $request->descriptions,
                'photo' => $fileUpload,
                'categorie'=>$request->categorie
            ]);

            DB::commit();

            return response()->json([
                'message' => 'actualite cree avec succes'
            ], 201);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function UpdateActualite(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'nom' => 'nullable|string',
            'descriptions' => 'nullable|string',
            'photo' => 'nullable|file',
              'categorie'=>'required|in:annonce,academique,social'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'les champs ne sont pas correctement renseignes'
            ], 400);
        }

        DB::beginTransaction();

        try {

            $actu = actualites::findOrFail($request->id);

            $fileUpload = $actu->photo;

            if ($request->hasFile('photo')) {
                $fileUpload = (new FileUpload())->UploadFile($request->file('photo'), 'actualites');
            }

            $actu->update([
                'nom' => $request->nom ?? $actu->nom,
                'descriptions' => $request->descriptions ?? $actu->descriptions,
                'photo' => $fileUpload
            ]);

            DB::commit();

            return response()->json([
                'message' => 'actualite modifiee avec succes'
            ], 200);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function DeleteActualite($id)
    {
        DB::beginTransaction();

        try {

            $actu = actualites::findOrFail($id);

            $actu->delete();

            DB::commit();

            return response()->json([
                'message' => 'actualite supprimee avec succes'
            ], 200);

        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function GetActualites()
    {
        $actualites = actualites::latest()->get();

        return response()->json([
            'actualites' => $actualites
        ]);
    }


    public function DetailActualite(int $id)
    {
        $actualite = actualites::findOrFail($id);

        return response()->json([
            'actualite' => $actualite
        ]);
    }

    public function TreeLatest(){
           $actualite = actualites::latest()->take(3)->get;

        return response()->json([
            'actualite' => $actualite
        ]);
    }
}