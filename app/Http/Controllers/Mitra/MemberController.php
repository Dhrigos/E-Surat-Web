<?php

namespace App\Http\Controllers\Mitra;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

use App\Models\UserCalon;
use App\Models\UserOrganisasi;
use App\Models\UserPrestasi;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Ensure user is Mitra Admin
        if (!$user->mitra_id) {
            abort(403, 'Unauthorized');
        }

        $query = User::query()
            ->where('mitra_id', $user->mitra_id)
            ->where('member_type', 'calon_anggota'); // Only show members/candidates

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%');
            });
        }

        $members = $query->latest()->paginate(10)->withQueryString();

        // Fetch Master Data for the form
        $jabatans = \App\Models\Jabatan::all();
        $jabatanRoles = \App\Models\JabatanRole::all();
        $golongans = \App\Models\Golongan::all();
        $pangkats = \App\Models\Pangkat::all();
        $sukus = \App\Models\Suku::all();
        $bangsas = \App\Models\Bangsa::all();
        $agamas = \App\Models\Agama::all();
        $statusPernikahans = \App\Models\Pernikahan::all();
        $goldars = \App\Models\Goldar::all();
        $pendidikans = \App\Models\Pendidikan::all();
        $pekerjaans = \App\Models\Pekerjaan::all();

        return Inertia::render('Mitra/Members/Index', [
            'members' => $members,
            'filters' => $request->only(['search']),
            'jabatans' => $jabatans,
            'jabatanRoles' => $jabatanRoles,
            'golongans' => $golongans,
            'pangkats' => $pangkats,
            'sukus' => $sukus,
            'bangsas' => $bangsas,
            'agamas' => $agamas,
            'status_pernikahans' => $statusPernikahans,
            'goldars' => $goldars,
            'pendidikans' => $pendidikans,
            'pekerjaans' => $pekerjaans,
        ]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();
        if (!$authUser->mitra_id) abort(403);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            
            // Calon Anggota Fields
            'matra' => 'required|string|in:AD,AL,AU',
            'nik' => 'required|string|size:16|unique:user_calon,nik',
            'nomor_kk' => 'required|string|min:16|max:16',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'alamat_domisili_lengkap' => 'nullable|string', // mapped from jalan

            'golongan_id' => 'required|exists:golongans,id',
            
            'suku_id' => 'required|exists:sukus,id',
            'bangsa_id' => 'required|exists:bangsas,id',
            'agama_id' => 'required|exists:agamas,id',
            'status_pernikahan_id' => 'required|exists:pernikahans,id',
            'nama_ibu_kandung' => 'required|string|max:255',
            'golongan_darah_id' => 'required|exists:goldars,id',
            'tinggi_badan' => 'required|numeric|min:100|max:250',
            'berat_badan' => 'required|numeric|min:30|max:200',
            'warna_kulit' => 'required|string|max:50',
            'warna_mata' => 'required|string|max:50',
            'warna_rambut' => 'required|string|max:50',
            'bentuk_rambut' => 'required|string|max:50',
            'birthplace_province_id' => 'required|string',

            // Size fields
            'ukuran_pakaian' => 'nullable|string|max:10',
            'ukuran_sepatu' => 'nullable|string|max:10',
            'ukuran_topi' => 'nullable|string|max:10',
            'ukuran_kaos_olahraga' => 'nullable|string|max:10',
            'ukuran_sepatu_olahraga' => 'nullable|string|max:10',
            'ukuran_kaos_pdl' => 'nullable|string|max:10',
            'ukuran_seragam_tactical' => 'nullable|string|max:10',
            'ukuran_baju_tidur' => 'nullable|string|max:10',
            'ukuran_training_pack' => 'nullable|string|max:10',
            'ukuran_baju_renang' => 'nullable|string|max:10',
            'ukuran_sepatu_tactical' => 'nullable|string|max:10',

            // Profession fields
            'is_bekerja' => 'required|string|in:bekerja,tidak_bekerja',
            'pekerjaan_id' => 'nullable|required_if:is_bekerja,bekerja|exists:pekerjaans,id',
            'nama_perusahaan' => 'nullable|required_if:is_bekerja,bekerja|string|max:255',
            'nama_profesi' => 'nullable|required_if:is_bekerja,bekerja|string|max:255',

            // Address logic
            'province_id' => 'required|string',
            'city_id' => 'required|string',
            'district_id' => 'required|string',
            'village_id' => 'required|string',
            'jalan' => 'required|string',

            'domisili_province_id' => 'nullable|string',
            'domisili_city_id' => 'nullable|string',
            'domisili_district_id' => 'nullable|string',
            'domisili_village_id' => 'nullable|string',
            'domisili_jalan' => 'nullable|string',

            // Documents
            'foto_profil' => 'required|image|max:15360',
            'tanda_tangan' => 'required|image|max:15360',
             // Files usually required for new user
            'doc_ktp' => 'required|file|max:15360',
            'doc_kk' => 'required|file|max:15360',
            'doc_ijazah' => 'required|file|max:15360',
            'doc_skck' => 'required|file|max:15360',
            'doc_surat_lamaran' => 'required|file|max:15360',
            'doc_sk_sehat' => 'required|file|max:15360',
            'doc_drh' => 'required|file|max:15360',
            'doc_sk_lurah' => 'required|file|max:15360',
            // optional
            'doc_latsarmil' => 'nullable|file|max:15360',
            'doc_izin_instansi' => 'nullable|file|max:15360',
            'doc_izin_ortu' => 'nullable|file|max:15360',
        ];

        if ($request->has('pendidikan_id')) {
            $rules['pendidikan_id'] = 'required|exists:pendidikans,id';
            $rules['nama_sekolah'] = 'required|string|max:255';
            $rules['nama_prodi'] = 'required|string|max:255';
            $rules['nilai_akhir'] = 'required|string|max:20';
            $rules['status_lulus'] = 'required|string|in:Lulus,Tidak Lulus,Sedang Menempuh';
        }

        $request->validate($rules);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $authUser) {
            $user = User::create([
                'name' => $request->name,
                'username' => $request->nik,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'password' => Hash::make($request->password),
                'member_type' => 'calon_anggota',
                'mitra_id' => $authUser->mitra_id, // Link to Admin's Mitra
                'verifikasi' => false,
                'ekyc_verified_at' => now(), // Admin created, assume verified identity or manual check
            ]);

            // 2. Prepare Data
            $data = $request->except([
                'password', 'password_confirmation', 'name', 'email', 
                'foto_profil', 'tanda_tangan', 
                'doc_ktp', 'doc_kk', 'doc_ijazah', 'doc_skck', 'doc_surat_lamaran', 'doc_sk_sehat', 'doc_drh', 'doc_latsarmil', 'doc_izin_instansi', 'doc_izin_ortu', 'doc_sk_lurah',
                'has_prestasi', 'prestasi', 'has_organisasi', 'organisasi'
            ]);

            $data['user_id'] = $user->id;
            $data['alamat_domisili_lengkap'] = $request->jalan;
            $data['nomor_registrasi'] = UserCalon::generateNomorRegistrasi(
                $data['matra'],
                $data['golongan_id'],
                $data['jenis_kelamin']
            );

            // Handle Files
             $fileFields = [
                'foto_profil', 'tanda_tangan',
                'doc_ktp', 'doc_kk', 'doc_ijazah', 'doc_skck', 
                'doc_surat_lamaran', 'doc_sk_sehat', 'doc_drh', 
                'doc_latsarmil', 'doc_izin_instansi', 'doc_izin_ortu', 'doc_sk_lurah'
            ];

            foreach ($fileFields as $field) {
                if ($request->hasFile($field)) {
                    $folder = 'user-details/' . str_replace('_', '-', $field);
                    if ($field === 'foto_profil') $folder = 'user-details/foto-profil';
                    if ($field === 'tanda_tangan') $folder = 'user-details/tanda-tangan';
                    
                    $data[$field] = $request->file($field)->store($folder, 'public');
                }
            }

            // Fix Dates
            $dateFields = ['tanggal_lahir'];
            foreach ($dateFields as $df) {
                if (!empty($data[$df])) {
                    $data[$df] = \Carbon\Carbon::parse($data[$df])->format('Y-m-d');
                }
            }

            // Create UserCalon
            UserCalon::create($data);

            // Handle Organisasi
            $hasOrganisasi = $request->input('has_organisasi');
            $organisasiData = $request->input('organisasi', []);
            if ($hasOrganisasi === 'ada' && is_array($organisasiData)) {
                foreach ($organisasiData as $item) {
                    if (!empty($item['nama_organisasi']) && !empty($item['posisi'])) {
                        UserOrganisasi::create([
                            'user_id' => $user->id,
                            'nama_organisasi' => $item['nama_organisasi'],
                            'posisi' => $item['posisi'],
                            'tanggal_mulai' => !empty($item['tanggal_mulai']) ? \Carbon\Carbon::parse($item['tanggal_mulai'])->format('Y-m-d') : null,
                            'tanggal_berakhir' => !empty($item['tanggal_berakhir']) ? \Carbon\Carbon::parse($item['tanggal_berakhir'])->format('Y-m-d') : null,
                            'informasi_tambahan' => $item['informasi_tambahan'] ?? null,
                            'is_active' => $item['is_active'] ?? false,
                        ]);
                    }
                }
            }

            // Handle Prestasi
            $hasPrestasi = $request->input('has_prestasi');
            $prestasiData = $request->input('prestasi', []);
            if ($hasPrestasi === 'ada' && is_array($prestasiData)) {
                foreach ($prestasiData as $item) {
                    if (!empty($item['nama_kegiatan'])) {
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
        });

        return redirect()->back()->with('success', 'Anggota berhasil ditambahkan.');
    }
}
