<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationQueueController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->where('verifikasi', false)
            ->whereHas('detail') // Only users who have completed their profile
            ->with([
                'detail.unitKerja',
                'detail.subunit',
                'detail.jabatan',
                'detail.statusKeanggotaan',
                'detail.pangkat',
                'locker'
            ])
            ->orderBy('updated_at', 'asc') // FIFO
            ->get();

        return Inertia::render('StaffMapping/VerificationQueue', [
            'users' => $users,
            'currentUserId' => auth()->id(),
        ]);
    }

    public function verify(User $user)
    {
        $user->update([
            'verifikasi' => true,
            'verification_locked_at' => null,
            'verification_locked_by' => null,
        ]);

        return redirect()->back()->with('success', 'User berhasil diverifikasi.');
    }

    public function lock(User $user)
    {
        if ($user->verification_locked_by && $user->verification_locked_by !== auth()->id()) {
            return redirect()->back()->with('error', 'User sedang diverifikasi oleh admin lain.');
        }

        $user->update([
            'verification_locked_at' => now(),
            'verification_locked_by' => auth()->id(),
        ]);

        return redirect()->back();
    }

    public function unlock(User $user)
    {
        if ($user->verification_locked_by === auth()->id()) {
            $user->update([
                'verification_locked_at' => null,
                'verification_locked_by' => null,
            ]);
        }

        return redirect()->back();
    }

    public function reject(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $user->update([
            'verification_locked_at' => null,
            'verification_locked_by' => null,
            'rejection_reason' => $request->reason,
        ]);

        return redirect()->back()->with('success', 'User berhasil ditolak.');
    }
}
