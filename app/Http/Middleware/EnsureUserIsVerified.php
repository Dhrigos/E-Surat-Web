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
        // Skip middleware for verification-related routes
        if ($request->routeIs('verification.*') ||
            $request->routeIs('complete-profile.*') ||
            $request->routeIs('logout')) {
            return $next($request);
        }

        // Only check verification for authenticated users
        if ($request->user() && ! $request->user()->verifikasi) {
            // Refresh user from database with relationships to get latest data (avoid cache issues)
            $user = $request->user()->fresh(['detail']);

            // 1. Check E-KYC first (Priority 1)
            // If E-KYC is not verified, redirect to E-KYC page
            if (! $user->ekyc_verified_at) {
                return redirect()->route('verification.ekyc');
            }

            // 2. Check Profile Details (Priority 2)
            // If E-KYC is verified but profile is incomplete, redirect to profile completion
            if (! $user->detail || ! $user->detail->nik) {
                return redirect()->route('complete-profile.create');
            }

            // 3. If both are done but admin verification (verifikasi column) is false
            return redirect()->route('verification.pending');
        }

        return $next($request);
    }
}
