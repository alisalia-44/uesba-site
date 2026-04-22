<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    //
    public function login(Request $request)
    {
        $request->validate([
            
            'email'    => 'required|email',
            'password' => 'required|min:8|string',
        ]);

        $admin = User::whereHas('roles', fn($q) => $q->where('name', 'Admin'))
            ->where('email', $request->email)
            ->first();

        if (!$admin) {
            return response()->json([
                'message' => 'Aucun utilisateur associé à cette adresse email.',
            ], 404);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants de connexion incorrects.',
            ], 401);
        }

        // Révoque les anciens tokens pour éviter l'accumulation
        $admin->tokens()->delete();

        $token = $admin->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token'   => $token,
        ]);
    }
    public function LogOut(Request $request)
    {
        try {
            $user = $request->user();
            if ($user) {
                // Revoke current access token (sanctum)
                if (method_exists($user, 'currentAccessToken') && $request->user()->currentAccessToken()) {
                    $request->user()->currentAccessToken()->delete();
                }
                $user->remember_token = '';
                $user->save();
            }
            return response()->json(['success' => true, 'message' => 'Déconnexion réussie']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la déconnexion', 'error' => $e->getMessage()], 500);
        }
    }
}
