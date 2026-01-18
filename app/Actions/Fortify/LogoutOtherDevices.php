<?php

namespace App\Actions\Fortify;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutOtherDevices
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  callable  $next
     * @return mixed
     */
    public function __invoke(Request $request, $next)
    {
        if (Auth::user()) {
            $userId = Auth::id();
            $sessionId = $request->session()->getId();

            // Check if there are ANY other sessions for this user in the database
            // We count sessions for this user that do NOT match the current session ID
            $otherSessionsExist = \Illuminate\Support\Facades\DB::table('sessions')
                ->where('user_id', $userId)
                ->where('id', '!=', $sessionId)
                ->exists();

            if ($otherSessionsExist) {
                // Strict Policy:
                // 1. Reset E-KYC
                $user = Auth::user();
                $user->update([
                    'ekyc_verified_at' => null,
                    'verifikasi' => 0,
                ]);

                // 2. Destroy ALL sessions for this user (including the current one we just created)
                \Illuminate\Support\Facades\DB::table('sessions')->where('user_id', $userId)->delete();

                // 3. Logout current user (just to be safe, though DB delete handles persistence)
                Auth::logout();

                // 4. Throw detailed error
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'password' => ['Silahkan Login Ulang'],
                    'login_error' => ['Terdeteksi login ganda. Akun Anda telah dikeluarkan dari semua perangkat dan lakukan verifikasi ulang.'],
                ]);
            }
        }

        return $next($request);
    }
}
