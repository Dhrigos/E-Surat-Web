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
            'jabatanRoles' => \App\Models\JabatanRole::where('is_active', true)->orderBy('nama')->get(),
            'golongans' => \App\Models\Golongan::orderBy('nama')->get(),
            'pangkats' => \App\Models\Pangkat::orderBy('nama')->get(),
            'rejectionReason' => request()->user()->rejection_reason,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $detail = $user->detail; // Get existing detail if any

        $rules = [
            'nia_nrp' => 'required|string|min:14|max:255|unique:user_details,nia_nrp'.($detail ? ','.$detail->id : ''),
            'nik' => 'required|string|max:255|unique:user_details,nik'.($detail ? ','.$detail->id : ''),
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat_domisili_lengkap' => 'nullable|string',
            'jabatan_id' => 'required|exists:jabatan,id',
            'jabatan_role_id' => 'nullable|exists:jabatan_roles,id',
            'pangkat_id' => 'required|exists:pangkat,id',
            'tanggal_pengangkatan' => 'required|date',
            'nomor_sk' => 'nullable|string|max:255',
            'nomor_kta' => 'required|string|max:255|unique:user_details,nomor_kta'.($detail ? ','.$detail->id : ''),

            'province_id' => 'required|string',
            'city_id' => 'required|string',
            'district_id' => 'required|string',
            'village_id' => 'required|string',
            'jalan' => 'required|string',

            // Office address fields (nullable)
            'office_province_id' => 'nullable|string',
            'office_city_id' => 'nullable|string',
            'mako_id' => 'nullable|exists:makos,id',
        ];

        // Make files optional if updating and they already exist (logic handled in frontend/backend check)
        // But for simplicity, we make them nullable in validation if detail exists,
        // and only update if file is present.
        $fileRules = $detail ? 'nullable' : 'required';
        // Check if KTP already exists (from E-KYC step)
        $ktpRules = ($detail && $detail->scan_ktp) ? 'nullable' : 'required';
        $rules['scan_ktp'] = "$ktpRules|mimes:jpg,jpeg,png,pdf|max:15360";

        $rules['foto_profil'] = "$fileRules|image|max:15360";
        // scan_ktp handled above
        $rules['scan_kta'] = "$fileRules|mimes:jpg,jpeg,png,pdf|max:15360";
        $rules['scan_sk'] = "$fileRules|mimes:jpg,jpeg,png,pdf|max:15360";
        $rules['tanda_tangan'] = "$fileRules|image|max:15360";

        $messages = [
            'nia_nrp.unique' => 'NRP sudah terdaftar.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nomor_kta.unique' => 'Nomor KTA sudah terdaftar.',
            'pangkat_id.required' => 'Pangkat wajib dipilih.',
        ];

        $request->validate($rules, $messages);

        $data = $request->except([
            'foto_profil', 'scan_ktp', 'scan_kta', 'scan_sk', 'tanda_tangan',
            'unit_kerja_id', 'subunit_id', 'status_keanggotaan_id',
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

        // Fix date format
        if (!empty($data['tanggal_lahir'])) {
            try {
                $data['tanggal_lahir'] = \Carbon\Carbon::parse($data['tanggal_lahir'])->format('Y-m-d');
            } catch (\Exception $e) {
                // Keep original if parse fails, validation might catch it or DB will error
            }
        }
        if (!empty($data['tanggal_pengangkatan'])) {
             try {
                $data['tanggal_pengangkatan'] = \Carbon\Carbon::parse($data['tanggal_pengangkatan'])->format('Y-m-d');
            } catch (\Exception $e) {
            }
        }

        UserDetail::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        // Ensure ekyc_verified_at is set (in case user skipped E-KYC or came directly)
        if (! $user->ekyc_verified_at) {
            $user->update(['ekyc_verified_at' => now()]);
        }

        // Refresh user to ensure middleware sees the updated ekyc_verified_at
        $user->refresh();

        // All done, redirect to pending page
        return redirect()->route('verification.pending');
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
        $request->validate([
            'image_selfie' => 'required|string', // Base64
            'scan_ktp' => 'required|file|image|max:15360', // File upload, max 15MB
        ]);

        $user = $request->user();
        $detail = $user->detail;

        // Process Selfie (Base64)
        $image_parts = explode(';base64,', $request->image_selfie);
        $image_type_aux = explode('image/', $image_parts[0]);
        $image_type = $image_type_aux[1];
        $image_base64 = base64_decode($image_parts[1]);
        $selfieFilename = 'selfie_ekyc_'.time().'.'.$image_type;
        $selfiePath = 'user-details/scan-selfie/'.$selfieFilename;
        \Illuminate\Support\Facades\Storage::disk('public')->put($selfiePath, $image_base64);

        // Process KTP (File)
        $ktpPath = $request->file('scan_ktp')->store('user-details/scan-ktp', 'public');

        if ($detail) {
            // Update existing detail
            $detail->update([
                'scan_selfie' => $selfiePath,
                'scan_ktp' => $ktpPath,
            ]);
        } else {
            // Create partial detail
            \App\Models\UserDetail::create([
                'user_id' => $user->id,
                'scan_selfie' => $selfiePath,
                'scan_ktp' => $ktpPath,
                // Initial empty values for required fields to avoid DB errors if strict mode is on,
                // otherwise nullable columns will handle it.
                // Assuming columns are nullable as per migration check.
            ]);
        }

        $user->update(['ekyc_verified_at' => now()]);

        // Determine redirect URL
        // If user already has complete profile (e.g. nia_nrp is filled), skip complete profile step
        if ($detail && $detail->nia_nrp) {
             return response()->json([
                'status' => 'success',
                'redirect' => route('verification.pending'),
            ]);
        }

        // Return redirect URL for frontend
        return response()->json([
            'status' => 'success',
            'redirect' => route('complete-profile.create'),
        ]);
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
