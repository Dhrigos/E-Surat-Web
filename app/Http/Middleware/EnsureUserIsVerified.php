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

            // 1. Check E-KYC first (Priority 1)
            // If E-KYC is not verified, redirect to E-KYC page
            if (! $request->user()->ekyc_verified_at) {
                return redirect()->route('verification.ekyc');
            }

            // 2. Check Profile Details (Priority 2)
            // If E-KYC is verified but profile is incomplete, redirect to profile completion
            if (! $request->user()->detail || ! $request->user()->detail->nik) {
                return redirect()->route('complete-profile.create');
            }

            // 3. If both are done but admin verification (verifikasi column) is false
            return redirect()->route('verification.pending');
        }

        return $next($request);
    }
}
