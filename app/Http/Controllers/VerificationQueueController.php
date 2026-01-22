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
    public function index(Request $request)
    {
        $type = $request->query('type', 'staff'); // Default to staff queue

        // Counts for tabs
        $staffQueueCount = User::where('member_type', 'anggota')
            ->where('verifikasi', false)
            ->whereNull('rejection_reason')
            ->doesntHave('staff')
            ->count();

        $calonQueueCount = User::where('member_type', 'calon_anggota')
            ->where('verifikasi', false)
            ->whereNull('rejection_reason')
            ->doesntHave('staff')
            ->whereHas('calon', function ($q) {
                $q->whereNotNull('nik')->where('nik', '!=', '');
            })
            ->count();

        // Build base query
        $query = User::query()
            ->where('verifikasi', false)
            ->whereNull('rejection_reason') // Only show pending queues (not rejected ones)
            ->doesntHave('staff') // Exclude users who are already mapped as Staff
            ->with(['locker'])
            ->orderBy('created_at', 'asc'); // FIFO by registration time (Stable)

        // Filter by type and load appropriate relationships
        if ($type === 'calon') {
            $query->where('member_type', 'calon_anggota')
                ->whereHas('calon', function ($q) {
                    $q->whereNotNull('nik')->where('nik', '!=', '');
                })
                ->with([
                    'calon.suku',
                    'calon.bangsa',
                    'calon.agama',
                    'calon.statusPernikahan',
                    'calon.golonganDarah',
                ]);
        } else {
            $query->where('member_type', 'anggota')
                ->with([
                    'member.jabatan',
                    'member.jabatanRole',
                    'member.pangkat',
                    'member.mako',
                ]);
        }

        $users = $query->get();

        return Inertia::render('StaffMapping/VerificationQueue', [
            'users' => $users,
            'currentUserId' => auth()->id(),
            'activeType' => $type,
            'staffQueueCount' => $staffQueueCount,
            'calonQueueCount' => $calonQueueCount,
        ]);
    }

    public function verify(User $user)
    {
        $user->update([
            'verifikasi' => true,
            'verification_duration' => $user->verification_locked_at 
                ? $user->verification_locked_at->diffInSeconds(now()) 
                : ($user->created_at ? $user->created_at->diffInSeconds(now()) : 0),
            'verification_locked_at' => null,
            'verification_locked_by' => null,
            'rejection_reason' => null, // Clear any previous rejection
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // Automatically create or update Staff record (Only for Anggota)
        $detail = $user->detail;
        if ($detail && $user->member_type === 'anggota') {
            \App\Models\Staff::updateOrCreate(
                [
                    'email' => $user->email, // Use email as unique identifier
                ],
                [
                    'user_id' => $user->id,
                    'manager_id' => auth()->id() ?? 1, // Default to auth user or Super Admin (ID 1)
                    'name' => $user->name,
                    'phone' => $user->phone_number ?? '0000000000',
                    'nip' => $detail->nik,
                    'nia' => $detail->nia_nrp,
                    'jabatan_id' => $detail->jabatan_id,
                    'pangkat_id' => $detail->pangkat_id, // Add this
                    'status_keanggotaan_id' => $detail->status_keanggotaan_id, // Add this just in case
                    'tanggal_masuk' => $detail->tanggal_pengangkatan ?? now(),
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
            'verification_duration' => $user->verification_locked_at 
                ? $user->verification_locked_at->diffInSeconds(now()) 
                : ($user->created_at ? $user->created_at->diffInSeconds(now()) : 0),
            'verification_locked_at' => null,
            'verification_locked_by' => null,
            'rejection_reason' => $request->reason,
            'verified_at' => now(), // Track when rejection happened
            'verified_by' => auth()->id(), // Track who rejected
            'ekyc_verified_at' => null, // Reset E-KYC verification status
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
