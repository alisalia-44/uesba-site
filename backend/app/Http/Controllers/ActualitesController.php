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
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240',
            'categorie' => 'required|in:annonce,academique,social'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'données invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $actu = DB::transaction(function () use ($request) {

                $fileUpload = null;

                if ($request->hasFile('photo')) {
                    $fileUpload = (new FileUpload())
                        ->UploadFile($request->file('photo'), 'actualites');
                }

                return actualites::create([
                    'nom' => $request->nom,
                    'descriptions' => $request->descriptions,
                    'photo' => $fileUpload,
                    'categorie' => $request->categorie
                ]);
            });

            return response()->json([
                'message' => 'actualité créée avec succès',
                'data' => $actu
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function UpdateActualite(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'nom' => 'nullable|string',
            'descriptions' => 'nullable|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240',
            'categorie' => 'nullable|in:annonce,academique,social'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'données invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $actu = actualites::findOrFail($request->id);

            $fileUpload = $actu->photo;

            if ($request->hasFile('photo')) {
                $fileUpload = (new FileUpload())
                    ->UploadFile($request->file('photo'), 'actualites');
            }

            $actu->update([
                'nom' => $request->nom ?? $actu->nom,
                'descriptions' => $request->descriptions ?? $actu->descriptions,
                'categorie' => $request->categorie ?? $actu->categorie,
                'photo' => $fileUpload
            ]);

            return response()->json([
                'message' => 'actualité modifiée avec succès',
                'data' => $actu
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function DeleteActualite($id)
    {
        try {
            $actu = actualites::findOrFail($id);

            // delete image if exists
            if ($actu->photo) {
                (new FileUpload())->DeleteFile($actu->photo);
            }

            $actu->delete();

            return response()->json([
                'message' => 'actualité supprimée avec succès'
            ], 200);

        } catch (Exception $e) {
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
        ], 200);
    }

    public function DetailActualite(int $id)
    {
        try {
            $actualite = actualites::findOrFail($id);

            return response()->json([
                'actualite' => $actualite
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'actualité introuvable'
            ], 404);
        }
    }

    public function TreeLatest()
    {
        $actualites = actualites::orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $actualites
        ], 200);
    }
}