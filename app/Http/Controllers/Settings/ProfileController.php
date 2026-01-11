<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->load('detail'); // Load user details

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'userDetail' => $user->detail,
            'jabatans' => \App\Models\Jabatan::active()->orderBy('nama')->get(),
            'activityLogs' => \App\Models\ActivityLog::where('user_id', $user->id)
                ->latest()
                ->limit(20)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'action' => $log->action,
                        'description' => $log->description,
                        'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                        'ip_address' => $log->ip_address,
                    ];
                }),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('profile')) {
            $request->user()->profile = $request->file('profile')->store('profiles', 'public');
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Update the user's detailed profile information.
     */
    public function updateDetails(Request $request): RedirectResponse
    {
        $user = $request->user();
        $detail = $user->detail;

        $rules = [
            'nia_nrp' => 'required|string|max:255|unique:user_details,nia_nrp'.($detail ? ','.$detail->id : ''),
            'nik' => 'required|string|max:255|unique:user_details,nik'.($detail ? ','.$detail->id : ''),
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat_domisili_lengkap' => 'nullable|string',
            'jabatan_id' => 'required|exists:jabatan,id',
            'tanggal_pengangkatan' => 'required|date',
            'nomor_sk' => 'required|string|max:255',
            'nomor_kta' => 'required|string|max:255',
            'province_id' => 'required|string',
            'city_id' => 'required|string',
            'district_id' => 'required|string',
            'village_id' => 'required|string',
            'jalan' => 'required|string',
        ];

        // Files are optional on update
        $fileRules = 'nullable';
        $rules['foto_profil'] = "$fileRules|image|max:2048";
        $rules['scan_ktp'] = "$fileRules|image|max:2048";
        $rules['scan_kta'] = "$fileRules|image|max:2048";
        $rules['scan_sk'] = "$fileRules|image|max:2048";
        $rules['tanda_tangan'] = "$fileRules|image|max:2048";

        $request->validate($rules);

        $data = $request->except([
            'foto_profil', 'scan_ktp', 'scan_kta', 'scan_sk', 'tanda_tangan',
            'unit_kerja_id', 'subunit_id', 'pangkat_id', 'status_keanggotaan_id',
        ]);
        $data['user_id'] = $user->id;
        $data['alamat_domisili_lengkap'] = $request->jalan; // Map jalan to alamat_domisili_lengkap

        if ($request->hasFile('foto_profil')) {
            $data['foto_profil'] = $request->file('foto_profil')->store('user-details/foto-profil', 'public');
        }
        if ($request->hasFile('scan_ktp')) {
            $data['scan_ktp'] = $request->file('scan_ktp')->store('user-details/scan-ktp', 'public');
        }
        if ($request->hasFile('scan_kta')) {
            $data['scan_kta'] = $request->file('scan_kta')->store('user-details/scan-kta', 'public');
        }
        if ($request->hasFile('scan_sk')) {
            $data['scan_sk'] = $request->file('scan_sk')->store('user-details/scan-sk', 'public');
        }
        if ($request->hasFile('tanda_tangan')) {
            $data['tanda_tangan'] = $request->file('tanda_tangan')->store('user-details/tanda-tangan', 'public');
        }

        \App\Models\UserDetail::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return back()->with('status', 'profile-details-updated');
    }

    public function downloadActivity(Request $request)
    {
        $user = $request->user();
        $logs = \App\Models\ActivityLog::where('user_id', $user->id)
            ->latest()
            ->limit(100) // Limit to last 100 for performance/relevance
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.activity-logs', ['logs' => $logs, 'user' => $user]);

        return $pdf->download('activity-logs-'.$user->username.'.pdf');
    }
}
