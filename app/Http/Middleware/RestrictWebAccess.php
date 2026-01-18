<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictWebAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow access to the download page and static assets
        if ($request->routeIs('download-app') || $request->is('images/*') || $request->is('build/*')) {
            return $next($request);
        }

        // Check for Capacitor App header
        if ($request->header('X-Capacitor-App')) {
            return $next($request);
        }

        // Allow API requests (typically for the mobile app or strict API calls)
        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return $next($request);
        }

        // Check for common mobile user agents
        $userAgent = strtolower($request->header('User-Agent'));
        $isMobile = str_contains($userAgent, 'mobile') || 
                    str_contains($userAgent, 'android') || 
                    str_contains($userAgent, 'iphone') || 
                    str_contains($userAgent, 'ipad') || 
                    str_contains($userAgent, 'ipod');

        // IF it IS a mobile device, redirect to download page
        // Check for App/WebView specific strings
        $isApp = str_contains($userAgent, 'wv') ||       // Android WebView
                 str_contains($userAgent, 'e-surat');    // Custom App Token

        // IF it IS a mobile device AND NOT an App, redirect to download page
        if ($isMobile && !$isApp) {
            // return redirect()->route('download-app');
            // DISABLED BY USER REQUEST
        }

        // Otherwise (Desktop, or Mobile in Desktop Mode), allow access
        // Note: Mobile in Desktop Mode will be handled by client-side JS
        return $next($request);
    }
}
