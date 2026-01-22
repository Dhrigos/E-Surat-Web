<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Agama;
use App\Models\Bangsa;
use App\Models\Golongan;
use App\Models\Goldar;
use App\Models\Jabatan;
use App\Models\JabatanRole;
use App\Models\Pangkat;
use App\Models\Pendidikan;
use App\Models\Pernikahan;
use App\Models\Suku;
use App\Models\Pekerjaan;
use App\Models\UserMember;
use App\Models\UserCalon;
use App\Models\UserPrestasi;
use App\Models\UserOrganisasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompleteProfileController extends Controller
{
    public function create()
    {
        $view = request()->routeIs('complete-profile-anggota.create') 
            ? 'Auth/CompleteProfileAnggota' 
            : 'Auth/CompleteProfile';

        $user = request()->user();
        $isAnggota = $user->member_type === 'anggota';
        $detail = $isAnggota ? $user->member : $user->calon;

        // Prepare existing data with file URLs for preview
        $existingData = null;
        if ($detail) {
            $existingData = [
                'scan_ktp' => $detail->scan_ktp ? \Storage::url($detail->scan_ktp) : null,
                'scan_selfie' => $detail->scan_selfie ? \Storage::url($detail->scan_selfie) : null,
                'foto_profil' => $detail->foto_profil ? \Storage::url($detail->foto_profil) : null,
            ];
        }

        return Inertia::render($view, [
            'jabatans' => Jabatan::active()->orderBy('nama')->get(),
            'jabatanRoles' => JabatanRole::where('is_active', true)->orderBy('nama')->get(),
            'golongans' => Golongan::orderBy('nama')->get(),
            'pangkats' => Pangkat::orderBy('nama')->get(),
            
            // New Reference Data
            'sukus' => Suku::orderBy('nama')->get(),
            'bangsas' => Bangsa::orderBy('nama')->get(),
            'agamas' => Agama::orderBy('nama')->get(),
            'status_pernikahans' => Pernikahan::orderBy('nama')->get(),
            'goldars' => Goldar::orderBy('nama')->get(),
            'pendidikans' => Pendidikan::all(),
            'pekerjaans' => Pekerjaan::orderBy('name')->get(),

            'existingFiles' => $existingData,
            'rejectionReason' => $user->rejection_reason,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isAnggota = $user->member_type === 'anggota';
        $detail = $isAnggota ? $user->member : $user->calon; // Get existing detail if any
        $tableName = $isAnggota ? 'user_member' : 'user_calon';

        $rules = [
            'nik' => 'required|string|max:255|unique:'.$tableName.',nik'.($detail ? ','.$detail->id : ''),
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat_domisili_lengkap' => 'nullable|string',
        ];

        // Add anggota-specific validation rules
        if ($isAnggota) {
            $rules['nia_nrp'] = 'required|string|min:14|max:255|unique:user_member,nia_nrp'.($detail ? ','.$detail->id : '');
            $rules['jabatan_id'] = 'nullable|exists:jabatan,id';
            $rules['jabatan_role_id'] = 'nullable|exists:jabatan_roles,id';
            $rules['pangkat_id'] = 'nullable|exists:pangkat,id';
            $rules['tanggal_pengangkatan'] = 'nullable|date';
            $rules['nomor_kta'] = 'nullable|string|max:255|unique:user_member,nomor_kta'.($detail ? ','.$detail->id : '');
            $rules['status_keanggotaan_id'] = 'nullable|exists:status_keanggotaans,id';
            $rules['mako_id'] = 'nullable|exists:makos,id';
            $rules['is_kta_lifetime'] = 'nullable|boolean';
            $rules['kta_start_date'] = 'nullable|date';
            $rules['kta_expired_at'] = 'nullable|date';
        } else {
            // Calon anggota specific fields
            $rules['matra'] = 'required|string|in:AD,AL,AU';
            $rules['golongan_id'] = 'required|exists:golongans,id';
            $rules['golongan_id'] = 'required|exists:golongans,id';

            $rules['suku_id'] = 'required|exists:sukus,id';
            $rules['bangsa_id'] = 'required|exists:bangsas,id';
            $rules['agama_id'] = 'required|exists:agamas,id';
            $rules['status_pernikahan_id'] = 'required|exists:pernikahans,id';
            $rules['nama_ibu_kandung'] = 'required|string|max:255';
            $rules['golongan_darah_id'] = 'required|exists:goldars,id';
            $rules['tinggi_badan'] = 'required|numeric|min:100|max:250';
            $rules['berat_badan'] = 'required|numeric|min:30|max:200';
            $rules['warna_kulit'] = 'required|string|max:50';
            $rules['warna_rambut'] = 'required|string|max:50';
            $rules['bentuk_rambut'] = 'required|string|max:50';
            
            // Profession fields (calon anggota only)
             $rules['is_bekerja'] = 'required|string|in:bekerja,tidak_bekerja';
             if ($request->input('is_bekerja') === 'bekerja') {
                 $rules['pekerjaan_id'] = 'required|exists:pekerjaans,id';
                 $rules['nama_perusahaan'] = 'required|string|max:255';
                 $rules['nama_profesi'] = 'required|string|max:255';
             }

             // Prestasi validation
             $rules['has_prestasi'] = 'nullable|string|in:ada,tidak_ada';
             if ($request->input('has_prestasi') === 'ada') {
                 $rules['prestasi'] = 'required|array|min:1';
                 $rules['prestasi.*.jenis_prestasi'] = 'required|string';
                 $rules['prestasi.*.tingkat'] = 'required|string';
                 $rules['prestasi.*.nama_kegiatan'] = 'required|string';
                 $rules['prestasi.*.pencapaian'] = 'required|string';
                 $rules['prestasi.*.tahun'] = 'required|string';
             }
             
            // Organisasi validation
            $rules['has_organisasi'] = 'nullable|string|in:ada,tidak_ada';
            if ($request->input('has_organisasi') === 'ada') {
                $rules['organisasi'] = 'required|array|min:1';
                $rules['organisasi.*.nama_organisasi'] = 'required|string';
                $rules['organisasi.*.posisi'] = 'required|string';
                $rules['organisasi.*.tanggal_mulai'] = 'required|date';
                $rules['organisasi.*.tanggal_berakhir'] = 'nullable|date|required_without:organisasi.*.is_active'; // Required if not active
                $rules['organisasi.*.is_active'] = 'boolean';
            }
        }

        // Common address fields
        $rules['province_id'] = 'required|string';
        $rules['city_id'] = 'required|string';
        $rules['district_id'] = 'required|string';
        $rules['village_id'] = 'required|string';
        $rules['jalan'] = 'required|string';

        // Office address fields (anggota only)
        if ($isAnggota) {
            $rules['office_province_id'] = 'nullable|string';
        }

        // Education fields (if applicable)
        if ($request->has('pendidikan_id')) {
            $rules['pendidikan_id'] = 'required|exists:pendidikans,id';
            $rules['nama_sekolah'] = 'required|string|max:255';
            $rules['nama_prodi'] = 'required|string|max:255';
            $rules['nilai_akhir'] = 'required|string|max:20';
            $rules['status_lulus'] = 'required|string|in:Lulus,Tidak Lulus,Sedang Menempuh';
        }

        // Make files optional if updating and they already exist (logic handled in frontend/backend check)
        // But for simplicity, we make them nullable in validation if detail exists,
        // and only update if file is present.
        $fileRules = $detail ? 'nullable' : 'required';
        // Check if KTP already exists (from E-KYC step) - No longer required by user
        // $ktpRules = ($detail && $detail->scan_ktp) ? 'nullable' : 'required';
        // $rules['scan_ktp'] = "$ktpRules|mimes:jpg,jpeg,png,pdf|max:15360";

        $rules['foto_profil'] = "$fileRules|image|max:15360";
        // scan_ktp handled above
        $rules['scan_kta'] = "nullable|mimes:jpg,jpeg,png,pdf|max:15360";
        $rules['scan_sk'] = "nullable|mimes:pdf,doc,docx|max:15360";
        $rules['tanda_tangan'] = "$fileRules|image|max:15360";

        // Supporting Documents Validation (calon anggota only)
        $documentFields = [];
        if (!$isAnggota) {
            $documentFields = [
                'doc_surat_lamaran',
                'doc_ktp',
                'doc_kk',
                'doc_sk_lurah',
                'doc_skck',
                'doc_ijazah',
                'doc_sk_sehat',
                'doc_drh',
                'doc_latsarmil',
                'doc_izin_instansi',
                'doc_izin_ortu',
            ];

            foreach ($documentFields as $docField) {
                // Check if file already exists for this user
                $hasFile = $detail && !empty($detail->$docField);
                $requirement = $hasFile ? 'nullable' : 'required';
                
                $rules[$docField] = "$requirement|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:15360";
            }
        }

        $messages = [
            'nia_nrp.unique' => 'NRP sudah terdaftar.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'nomor_kta.unique' => 'Nomor KTA sudah terdaftar.',
            'nomor_kta.unique' => 'Nomor KTA sudah terdaftar.',
            'matra.required' => 'Matra wajib dipilih.',
            'golongan_id.required' => 'Golongan wajib dipilih.',
            'kta_start_date.required_if' => 'Tanggal mulai KTA wajib diisi jika tidak seumur hidup.',
            'kta_expired_at.required_if' => 'Tanggal berakhir KTA wajib diisi jika tidak seumur hidup.',
             // Add custom messages for array fields if needed
             'prestasi.*.jenis_prestasi.required' => 'Jenis prestasi wajib diisi.',
             'organisasi.*.nama_organisasi.required' => 'Nama organisasi wajib diisi.',
        ];

        $request->validate($rules, $messages);

        $data = $request->except([
            'foto_profil', 'scan_ktp', 'scan_kta', 'scan_sk', 'tanda_tangan',
            'doc_surat_lamaran', 'doc_ktp', 'doc_kk', 'doc_sk_lurah', 'doc_skck',
            'doc_ijazah', 'doc_sk_sehat', 'doc_drh', 'doc_latsarmil',
            'doc_izin_instansi', 'doc_izin_ortu',
            'unit_kerja_id', 'subunit_id', 'status_keanggotaan_id',
            'alamat_domisili_lengkap', // Exclude this to prevent null override
            'birthplace_province_id', // Not a field in user_member table
            'has_prestasi', 'prestasi', // Exclude array related input
            'has_organisasi', 'organisasi', // Exclude array related input
        ]);

        if ($isAnggota) {
             // remove fields not relevant for anggota
             unset($data['golongan_id'], $data['mata']); // matra maybe not needed if not in use
        }

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

        // Handle New Documents Upload (Using the same array defined above or redefine if scope issues)
        // Redefining for safety in this scope if needed, but we can reuse if we moved definition up. 
        // To be safe and clean, let's just reuse the list manually or variable if it was in scope.
        // Since we defined $documentFields inside store() before, we can reuse it.
        
        foreach ($documentFields as $docField) {
            if ($request->hasFile($docField)) {
                $data[$docField] = $request->file($docField)->store('user-details/supporting-docs', 'public');
            }
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
        if (!empty($data['kta_expired_at'])) {
             try {
                $data['kta_expired_at'] = \Carbon\Carbon::parse($data['kta_expired_at'])->format('Y-m-d');
            } catch (\Exception $e) {
            }
        }
        if (!empty($data['kta_start_date'])) {
             try {
                $data['kta_start_date'] = \Carbon\Carbon::parse($data['kta_start_date'])->format('Y-m-d');
            } catch (\Exception $e) {
            }
        }
        
        // Handle logic if lifetime is true, force expired_at to null
        if ($request->is_kta_lifetime) {
            $data['kta_start_date'] = null;
            $data['kta_expired_at'] = null;
        }

        // Save to appropriate table based on member type
        if ($isAnggota) {
            UserMember::updateOrCreate(
                ['user_id' => $user->id],
                $data
            );
        } else {
            UserCalon::updateOrCreate(
                ['user_id' => $user->id],
                $data
            );
        }

        // Handle Organisasi
        $hasOrganisasi = $request->input('has_organisasi');
        $organisasiData = $request->input('organisasi', []);
        
        // Always refresh: delete existing and create new
        $user->organisasis()->delete(); // Relationship in User Model : public function organisasis() { return $this->hasMany(UserOrganisasi::class); }
        // Assuming relationship is defined in User model. If not, use UserOrganisasi::where('user_id', $user->id)->delete();
        UserOrganisasi::where('user_id', $user->id)->delete();

        if ($hasOrganisasi === 'ada' && is_array($organisasiData)) {
            foreach ($organisasiData as $item) {
                if (!empty($item['nama_organisasi']) && !empty($item['posisi'])) {
                    // Normalize dates
                    $startDate = !empty($item['tanggal_mulai']) ? \Carbon\Carbon::parse($item['tanggal_mulai'])->format('Y-m-d') : null;
                    $endDate = !empty($item['tanggal_berakhir']) ? \Carbon\Carbon::parse($item['tanggal_berakhir'])->format('Y-m-d') : null;
                    
                    UserOrganisasi::create([
                        'user_id' => $user->id,
                        'nama_organisasi' => $item['nama_organisasi'],
                        'posisi' => $item['posisi'],
                        'tanggal_mulai' => $startDate,
                        'tanggal_berakhir' => $item['is_active'] ? null : $endDate,
                        'informasi_tambahan' => $item['informasi_tambahan'] ?? null,
                        'is_active' => $item['is_active'] ?? false,
                    ]);
                }
            }
        }

        // Handle Prestasi
        $hasPrestasi = $request->input('has_prestasi');
        $prestasiData = $request->input('prestasi', []);

        UserPrestasi::where('user_id', $user->id)->delete();

        if ($hasPrestasi === 'ada' && is_array($prestasiData)) {
            foreach ($prestasiData as $item) {
                if (!empty($item['nama_kegiatan']) && !empty($item['pencapaian'])) {
                    UserPrestasi::create([
                        'user_id' => $user->id,
                        'jenis_prestasi' => $item['jenis_prestasi'],
                        'tingkat' => $item['tingkat'],
                        'nama_kegiatan' => $item['nama_kegiatan'],
                        'pencapaian' => $item['pencapaian'],
                        'tahun' => $item['tahun'],
                    ]);
                }
            }
        }

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
        $isAnggota = $user->member_type === 'anggota';
        $detail = $isAnggota ? $user->member : $user->calon;

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
            // Create partial detail based on member type
            $modelClass = $isAnggota ? UserMember::class : UserCalon::class;
            $modelClass::create([
                'user_id' => $user->id,
                'scan_selfie' => $selfiePath,
                'scan_ktp' => $ktpPath,
            ]);
        }

        $user->update(['ekyc_verified_at' => now()]);

        // Determine redirect URL
        // If user already has complete profile (e.g. nia_nrp is filled), skip complete profile step
        if ($detail && ($isAnggota ? $detail->nia_nrp : $detail->nik)) {
             return response()->json([
                'status' => 'success',
                'redirect' => route('verification.pending'),
            ]);
        }

        // Return redirect URL for frontend
        // Return redirect URL for frontend
        $route = $user->member_type === 'anggota' 
            ? 'complete-profile-anggota.create' 
            : 'complete-profile.create';

        return response()->json([
            'status' => 'success',
            'redirect' => route($route),
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
