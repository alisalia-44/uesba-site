<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Store a new message.
     */
    public function store(Request $request)
    {
        try {
            // Normalise name field
            $name = $request->input('nom_complet') ?? $request->input('name') ?? null;
            $email = $request->input('email');
            $messageText = $request->input('message');

            // validation
            if (!$name) {
                return response()->json(['success' => false, 'error' => 'Le nom est requis.'], 422);
            }
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return response()->json(['success' => false, 'error' => 'Email invalide.'], 422);
            }
            if (!$messageText || trim($messageText) === '') {
                return response()->json(['success' => false, 'error' => 'Le message est requis.'], 422);
            }

            $msg = Message::create([
                'nom_complet' => $name,
                'email' => $email,
                'message' => $messageText
            ]);

            return response()->json(['success' => true, 'data' => $msg], 201);
        } catch (\Exception $e) {
            Log::error('MessageController@store error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Erreur serveur lors de l\'enregistrement du message.'], 500);
        }
    }

    /**
     * List messages (admin).
     */
    public function index(Request $request)
    {
        try {
            $messages = Message::orderBy('created_at', 'desc')->get();
            return response()->json(['success' => true, 'data' => $messages], 200);
        } catch (\Exception $e) {
            Log::error('MessageController@index error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Impossible de récupérer les messages.'], 500);
        }
    }

    /**
     * Delete a message by id.
     */
    public function destroy($id)
    {
        try {
            $msg = Message::find($id);
            if (!$msg) {
                return response()->json(['success' => false, 'error' => 'Message introuvable.'], 404);
            }
            $msg->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('MessageController@destroy error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Erreur lors de la suppression.'], 500);
        }
    }
}
