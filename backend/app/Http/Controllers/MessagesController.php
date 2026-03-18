<?php

namespace App\Http\Controllers;

use App\Models\messages;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    // Public: store visitor message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $msg = messages::create([
            'nom_complet' => $validated['nom_complet'],
            'email' => $validated['email'],
            'message' => $validated['message'],
        ]);

        return response()->json(['success' => true, 'message' => 'Message reçu', 'data' => $msg], 201);
    }

    // Admin: list messages
    public function index(Request $request)
    {
        $msgs = messages::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $msgs]);
    }
}
