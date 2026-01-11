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
            ! $request->routeIs('verification.*') &&
            ! $request->routeIs('logout')) {
            
            // If user has filled their details but not verified
            if ($request->user()->detail) {
                // Check if E-KYC is passed
                if ($request->user()->ekyc_verified_at) {
                    return redirect()->route('verification.pending');
                }
                
                // If not passed E-KYC, go to E-KYC page
                return redirect()->route('verification.ekyc');
            }
            
            // Otherwise send to fill profile
            return redirect()->route('complete-profile.create');
        }

        return $next($request);
    }
}
