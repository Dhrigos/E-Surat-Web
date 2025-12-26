<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class RevokeVerificationOnMultiSession
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        $currentSessionId = Session::getId();

        // Check for other active sessions for this user
        $otherSessionsCount = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->count();

        if ($otherSessionsCount > 0) {
            // Revoke verification
            $user->forceFill([
                'verifikasi' => false,
                'rejection_reason' => 'Terdeteksi login aktif di perangkat lain. Akun Anda ditangguhkan sementara. Silakan lakukan verifikasi ulang.',
            ])->save();

            // Destroy all other sessions to enforce single session
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();
        }
    }
}
