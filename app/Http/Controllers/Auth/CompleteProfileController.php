<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompleteProfileController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/CompleteProfile', [
            'jabatans' => Jabatan::active()->orderBy('nama')->get(),
            'rejectionReason' => request()->user()->rejection_reason,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $detail = $user->detail; // Get existing detail if any

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
            'nomor_kta' => 'required|string|max:255|unique:user_details,nomor_kta'.($detail ? ','.$detail->id : ''),
            'province_id' => 'required|string',
            'city_id' => 'required|string',
            'district_id' => 'required|string',
            'village_id' => 'required|string',
            'jalan' => 'required|string',
        ];

        // Make files optional if updating and they already exist (logic handled in frontend/backend check)
        // But for simplicity, we make them nullable in validation if detail exists,
        // and only update if file is present.
        $fileRules = $detail ? 'nullable' : 'required';
        $rules['foto_profil'] = "$fileRules|image|max:2048";
        $rules['scan_ktp'] = "$fileRules|image|max:2048";
        $rules['scan_kta'] = "$fileRules|image|max:2048";
        $rules['scan_sk'] = "$fileRules|image|max:2048";
        $rules['tanda_tangan'] = "$fileRules|image|max:2048";

        $messages = [
            'nia_nrp.unique' => 'NIA/NRP sudah terdaftar.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nomor_kta.unique' => 'Nomor KTA sudah terdaftar.',
        ];

        $request->validate($rules, $messages);

        $data = $request->except([
            'foto_profil', 'scan_ktp', 'scan_kta', 'scan_sk', 'tanda_tangan',
            'unit_kerja_id', 'subunit_id', 'pangkat_id', 'status_keanggotaan_id',
        ]);

        $data['user_id'] = $user->id;
        // Map jalan to alamat_domisili_lengkap since frontend uses jalan input for address
        $data['alamat_domisili_lengkap'] = $request->jalan;

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

        UserDetail::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        // Redirect to E-KYC verification page
        return redirect()->route('verification.ekyc');
    }

    public function ekyc()
    {
        return Inertia::render('Auth/VerificationEkyc');
    }

    public function pending()
    {
        return Inertia::render('Auth/VerificationPending');
    }

    public function approveEkyc(Request $request)
    {
        $request->user()->update(['ekyc_verified_at' => now()]);
        return response()->json(['status' => 'success']);
    }

    public function verificationStatus(Request $request)
    {
        return response()->json([
            'verifikasi' => $request->user()->verifikasi,
            'verification_locked_by' => $request->user()->verification_locked_by,
            'rejection_reason' => $request->user()->rejection_reason,
        ]);
    }
}
