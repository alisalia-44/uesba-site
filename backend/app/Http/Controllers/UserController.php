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
use Mail;

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
            'message' => 'renseigner tous les champs'
        ], 400);
    }

    try {

        $user = User::create([
            'email' => $request->email,
            'name' => $request->nom,
            'prenom' => $request->prenom,
            'annePoste' => $request->annePoste ?? null,
            'descriptions' => $request->descriptions ?? null,
            'postes' => $request->poste,
            'password' => bcrypt(Str::random(10))
        ]);

        // Upload image
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
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
    public function SupprimerMembre(request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'connexion requise'
            ]);
        }
        $validator = Validator::make($request->all(), [
            'id' => 'required'
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
                'message' => 'membre supprimer'
            ]);
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
            ]);
        }
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'photo' => 'nullable|mimes:*',
            'nom' => 'nullable|string',
            'prenom' => 'nullable|string',
            'poste' => 'nullabmembres_bureauxle|string',
            'annePoste' => 'nullable|datetime',
            'descriptions' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'renseigner tous les champs'
            ], 400);
        }
        try {
            $user = User::find($request->id);

            if (!$user) {
                return response()->json([
                    'message' => 'oups membre non trouve!'
                ], 404);
            }
            $fileup = new FileUpload();
            $user = User::update([
                'email' => $request->email ?? $user->email,
                'name' => $request->nom ?? $user->name,
                'prenom' => $request->prenom ?? $user->prenom,
                'annePoste' => $request->annePoste ?? $user->annePoste,
                'decriptions' => $request->descriptions ?? $user->descriptions,
                'photo' => $fileup->UploadFile($request->file, 'photo') ?? $user->photo
            ]);

            return response()->json([
                'message' => 'utilisateur modifier avec succes'
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
                'message' => ' les champs ne sont pas correctements remplis'
            ], 400);
        }

        try {
            $mail = new MailService($request->email, $request->message, $request->nom_complet);

            messages::create([
                'email' => $request->email,
                'message' => $request->message,
                'nom_complet' => $request->nom_complet
            ]);
            return response()->json([
                'message' => 'mail envoyer avec succes'
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
            ]);
        }
        $mail = Cache::remember('mail', now()->addMinutes(30), function () {
            return messages::all();
        });

        return response()->json([
            'mail' => $mail
        ], 200);
    }

    public function SetMemberPast(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'id' => 'required'
        ]);

        if ($validator->fails()){
            return response()->json([
                'message'=>'donnee non valide'
            ],400);
        }
        DB::beginTransaction();
        try {
            $member = user::findOrFail($request->id);
            if (!$member->poste || !$member->AnnePost){
                return response()->json([
                    'message'=>'cet membre n\'est pas habilite'
                ],401);
            }

            $member->update([
                'is_ancien'=>true
            ]);
            DB::commit();
            return response()->json([
                'message'=>'mise a jour'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message'=>'une erreur est survenue'
            ],500);
        }
    }
public function GetMembers()
{
    $membres = User::whereHas('roles', fn($q) => $q->where('name', 'membres_bureaux'))->get();
    
    return response()->json([$membres],200);
}
}
