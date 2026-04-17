<?php

namespace App\Http\Controllers;

use App\Http\Services\FileUpload;
use App\Http\Services\MailService;
use App\Models\messages;
use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function AjouterMembre(Request $request)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'message' => 'connexion requise'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'poste' => 'nullable|string',
            'annePoste' => 'nullable|string',
            'descriptions' => 'nullable|string',
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'renseigner tous les champs correctement'
            ], 400);
        }

        try {
            $user = User::create([
                'email' => $request->email,
                'name' => $request->nom,
                'prenom' => $request->prenom,
                'annePoste' => $request->annePoste,
                'descriptions' => $request->descriptions,
                'postes' => $request->poste,
                'password' => bcrypt(str()->random(10))
            ]);

            if ($request->hasFile('photo')) {
                $fileup = new FileUpload();
                $name = $fileup->UploadFile($request->file('photo'), 'photo');

                $user->update([
                    'photo' => $name
                ]);
            }

            $user->assignRole('membres_bureaux');

            return response()->json([
                'message' => 'membre ajouté avec succès'
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function SupprimerMembre(Request $request)
    {
        $userAuth = $request->user();

        if (!$userAuth) {
            return response()->json([
                'message' => 'connexion requise'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'entrez un id valide'
            ], 400);
        }

        try {
            $user = User::findOrFail($request->id);
            $user->delete();

            return response()->json([
                'message' => 'membre supprimé'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function ModiferMembre(Request $request)
    {
        $current = $request->user();

        if (!$current) {
            return response()->json([
                'message' => 'connexion requise'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png',
            'nom' => 'nullable|string',
            'prenom' => 'nullable|string',
            'poste' => 'nullable|string',
            'annePoste' => 'nullable|string',
            'descriptions' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'données invalides'
            ], 400);
        }

        try {
            $user = User::find($request->id);

            if (!$user) {
                return response()->json([
                    'message' => 'membre non trouvé'
                ], 404);
            }

            $fileup = new FileUpload();

            $photo = $request->hasFile('photo')
                ? $fileup->UploadFile($request->file('photo'), 'photo')
                : $user->photo;

            $user->update([
                'email' => $request->email ?? $user->email,
                'name' => $request->nom ?? $user->name,
                'prenom' => $request->prenom ?? $user->prenom,
                'annePoste' => $request->annePoste ?? $user->annePoste,
                'descriptions' => $request->descriptions ?? $user->descriptions,
                'photo' => $photo
            ]);

            return response()->json([
                'message' => 'utilisateur modifié avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function SendMail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'message' => 'required|string',
            'nom_complet' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'les champs sont invalides'
            ], 400);
        }

        try {
            new MailService($request->email, $request->message, $request->nom_complet);

            messages::create([
                'email' => $request->email,
                'message' => $request->message,
                'nom_complet' => $request->nom_complet
            ]);

            return response()->json([
                'message' => 'mail envoyé avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function MailList(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'connexion requise'
            ], 401);
        }

        $mail = Cache::remember('mail_list', now()->addMinutes(30), function () {
            return messages::latest()->get();
        });

        return response()->json([
            'mail' => $mail
        ], 200);
    }

    public function SetMemberPast(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'donnée non valide'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $member = User::findOrFail($request->id);

            if (!$member->postes || !$member->annePoste) {
                return response()->json([
                    'message' => 'ce membre n’est pas habilité'
                ], 401);
            }

            $member->update([
                'is_ancien' => true
            ]);

            DB::commit();

            return response()->json([
                'message' => 'mise à jour réussie'
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'une erreur est survenue'
            ], 500);
        }
    }

    public function GetMembers()
    {
        $membres = User::whereHas('roles', function ($q) {
            $q->where('name', 'membres_bureaux');
        })->get();

        return response()->json([
            'membres' => $membres
        ], 200);
    }
}