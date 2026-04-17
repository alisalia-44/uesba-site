<?php

namespace App\Http\Controllers;

use App\Models\actualites;
use App\Models\evenements;
use App\Models\messages;
use App\Models\User;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function Dash(Request $request)
    {
        $event = evenements::count();
        $actu = actualites::count();
        $mes = messages::count();

      
        $membre = User::whereHas('roles', function ($q) {
            $q->where('name', 'utilisateurs');
        })->count();

        return response()->json([
            'nb_event' => $event ?? 0,
            'nb_membre' => $membre ?? 0,
            'nb_actu' => $actu ?? 0,
            'nb_message' => $mes ?? 0
        ], 200);
    }
}