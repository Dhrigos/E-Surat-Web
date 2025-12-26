<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UnitKerja;
use App\Models\Pangkat;
use App\Models\Jabatan;
use App\Models\StatusKeanggotaan;

class CompleteProfileController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/CompleteProfile', [
            'unitKerjas' => UnitKerja::active()->root()->get(),
            'allUnits' => UnitKerja::active()->get(),
            'statusKeanggotaans' => StatusKeanggotaan::all(),
            'rejectionReason' => request()->user()->rejection_reason,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $detail = $user->detail; // Get existing detail if any

        $rules = [
            'nia_nrp' => 'required|string|max:255|unique:user_details,nia_nrp' . ($detail ? ',' . $detail->id : ''),
            'nik' => 'required|string|max:255|unique:user_details,nik' . ($detail ? ',' . $detail->id : ''),
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat_domisili_lengkap' => 'nullable|string',
            'unit_kerja_id' => 'required|exists:unit_kerja,id',
            'subunit_id' => 'nullable|exists:unit_kerja,id',
            'jabatan_id' => 'required|exists:jabatan,id',
            'status_keanggotaan_id' => 'required|exists:status_keanggotaans,id',
            'pangkat_id' => 'required|exists:pangkat,id',
            'tanggal_pengangkatan' => 'required|date',
            'nomor_sk' => 'required|string|max:255',
            'nomor_kta' => 'required|string|max:255',
            'province_id' => 'required|string',
            'city_id' => 'required|string',
            'district_id' => 'required|string',
            'village_id' => 'required|string',
            'postal_code' => 'required|string',
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

        $request->validate($rules);

        $data = $request->except(['foto_profil', 'scan_ktp', 'scan_kta', 'scan_sk', 'tanda_tangan']);
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

        // Don't auto-verify yet, redirect to video call verification
        // $user->update(['verifikasi' => true]);

        return redirect()->route('complete-profile.video-call');
    }

    public function videoCall()
    {
        return Inertia::render('Auth/VerificationVideoCall');
    }

    public function verificationStatus(Request $request)
    {
        return response()->json([
            'verifikasi' => $request->user()->verifikasi,
            'verification_locked_by' => $request->user()->verification_locked_by,
            'rejection_reason' => $request->user()->rejection_reason,
        ]);
    }

    public function getJabatanByUnit(Request $request)
    {
        $unitId = $request->unit_id;
        $unit = UnitKerja::find($unitId);
        
        if (!$unit) {
            return response()->json([]);
        }

        $jabatans = $unit->jabatans()
            ->wherePivot('is_active', true)
            ->get();
        
        return response()->json($jabatans);
    }

    public function getStatusByJabatan(Request $request)
    {
        $jabatanId = $request->jabatan_id;
        $jabatan = Jabatan::find($jabatanId);
        
        if (!$jabatan) {
            return response()->json([]);
        }

        $statuses = $jabatan->statusKeanggotaans()
            ->wherePivot('is_active', true)
            ->get();
        
        return response()->json($statuses);
    }

    public function getPangkatByStatus(Request $request)
    {
        $statusId = $request->status_id;
        $status = StatusKeanggotaan::find($statusId);
        
        if (!$status) {
            return response()->json([]);
        }

        $pangkats = $status->pangkats()
            ->wherePivot('is_active', true)
            ->orderBy('tingkat')
            ->get();
        
        return response()->json($pangkats);
    }
}
