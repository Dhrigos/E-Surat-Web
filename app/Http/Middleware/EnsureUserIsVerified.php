<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && 
            ! $request->user()->verifikasi &&
            ! $request->routeIs('complete-profile.*') &&
            ! $request->routeIs('logout')) {
            
            // If user has filled their details but not verified, send to video call
            if ($request->user()->detail) {
                // Check if there are other sessions for this user
                $otherSessions = \Illuminate\Support\Facades\DB::table('sessions')
                    ->where('user_id', $request->user()->id)
                    ->where('id', '!=', $request->session()->getId())
                    ->count();

                if ($otherSessions > 0) {
                    session()->flash('warning', 'Login terdeteksi di perangkat lain.');
                }

                return redirect()->route('complete-profile.video-call');
            }
            
            // Otherwise send to fill profile
            return redirect()->route('complete-profile.create');
        }

        return $next($request);
    }
}
