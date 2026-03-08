<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class isAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    
    {

            $user = $request->user(); 

            if (!$user->isAdmin()) {
                return response()->json([
                    'message'=> 'non autoriser'
                ],409);
            }

        return $next($request);
    }
}
