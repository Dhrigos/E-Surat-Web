<?php

namespace App\Http\Controllers;

use App\Mail\VerificationApprovedMail;
use App\Mail\VerificationRejectedMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class VerificationQueueController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->where('verifikasi', false)
            ->whereNull('rejection_reason') // Only show pending queues (not rejected ones)
            ->whereHas('detail') // Only users who have completed their profile
            ->with([
                'detail.jabatan',
                'locker',
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
            'rejection_reason' => null, // Clear any previous rejection
        ]);

        // Automatically create Staff record
        $detail = $user->detail;
        if ($detail) {
            \App\Models\Staff::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'manager_id' => auth()->id() ?? 1, // Default to auth user or Super Admin (ID 1)
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone_number ?? '0000000000',
                    'nip' => $detail->nik,
                    'nia' => $detail->nia_nrp,
                    'pangkat_id' => $detail->pangkat_id,
                    'jabatan_id' => $detail->jabatan_id,
                    'unit_kerja_id' => $detail->unit_kerja_id,
                    'status_keanggotaan_id' => $detail->status_keanggotaan_id,
                    'tanggal_masuk' => now(),
                    'role' => 'staff',
                    'status' => 'active',
                ]
            );
        }

        // Send Approved Email
        try {
            Mail::to($user)->send(new VerificationApprovedMail($user));
        } catch (\Exception $e) {
            // Log error or ignore if mail fails, but continue flow
        }

        return redirect()->back()->with('success', 'User berhasil diverifikasi dan email notifikasi telah dikirim.');
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

        // Send Rejected Email
        try {
            Mail::to($user)->send(new VerificationRejectedMail($user, $request->reason));
        } catch (\Exception $e) {
            // Log error
        }

        return redirect()->back()->with('success', 'User berhasil ditolak dan email notifikasi telah dikirim.');
    }
}
