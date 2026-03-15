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
    public function Login(Request $request)
    {
        $validaor = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:8|string'
        ]);

        // $e=User::firstOrCreate([
        //     'email'=>'yobibah725@gmail.com',
        //     'name'=>'BA',
        //     'prenom'=>'Yobi',
        //     'password'=>Hash::make('12345678')
        // ]);
        // $e->assignRole('Admin');

        if ($validaor->fails()) {
            return response()->json([
                'message' => 'les champs ne sont pas correctements renseigner'
            ], 400);
        }

        try {
            $credientials = $request->only('email', 'password');
            $admin = User::whereHas('roles', fn($q) => $q->where('name', 'Admin'))->where('email', $request->email)->first();

            if (!$admin) {
                return response()->json([
                    'message' => 'aucun utilisateur associe a cet adresse email.',
                    'code' => 404
                ], 404);
            }

            if (!Auth::attempt($credientials)) {
                return response()->json([

                    'message' => 'Identifient de connexion incorrect',
                    'code' => 401

                ], 401);
            }

            $token = $admin->createToken('auth_token')->plainTextToken;
            $admin = Auth::user();
            // $admin->remember_token = $token;

            $admin->update([
                'remember_token' => $token
            ]);

            return response()->json([
                'message' => 'redirection en cours...',
                'token' => $token,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'une erreur est survenue ' . $e->getMessage()
            ]);
        }
    }

    public function LogOut(Request $request)
    {
        $user = $request->user();
        $user->remember_token = '';
        session_destroy();
    }
}
