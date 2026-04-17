<?php

namespace App\Http\Controllers;

use App\Models\messages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class MessagesController extends Controller
{
  
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom_complet' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'données invalides',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $msg = messages::create([
                'nom_complet' => $request->nom_complet,
                'email' => $request->email,
                'message' => $request->message,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'message reçu avec succès',
                'data' => $msg
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function index(Request $request)
    {
        try {
            $msgs = messages::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $msgs
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy($id)
    {
        try {
            $msg = messages::findOrFail($id);

            $msg->delete();

            return response()->json([
                'success' => true,
                'message' => 'message supprimé avec succès'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'message introuvable ou erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}