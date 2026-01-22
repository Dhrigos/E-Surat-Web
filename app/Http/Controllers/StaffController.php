<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class StaffController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            // Middleware is handled in routes/web.php
        ];
    }

    public function index(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('StaffController::index accessed');
            $query = User::with(['roles', 'member.jabatan', 'member.jabatanRole', 'member.pangkat', 'member.mako'])
                ->where('member_type', 'anggota')
                ->whereDoesntHave('roles', function ($q) {
                    $q->where('name', 'super-admin');
                })
                // Exclude users currently in verification queue (pending verification)
                // Queue = Not verified AND Not rejected (rejection_reason is null)
                // Filter: Show only Verified users. Rejected users are hidden.
                ->where('verifikasi', true);

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('detail', function ($q) use ($search) {
                            $q->where('nip', 'like', "%{$search}%")
                                ->orWhere('nia_nrp', 'like', "%{$search}%");
                        });
                });
            }

            // Get master data for dropdowns
            $jabatanList = Jabatan::active()->orderBy('nama')->get();
            // $roles = \App\Models\Role::with('permissions')->orderBy('name')->get();
            // Using string role for simple assignment as seen in existing code, but fetching roles for list is good
            $roles = \App\Models\Role::orderBy('name')->get();

            $users = $query->orderBy('name')->get()->map(function ($user) {
                $detail = $user->member;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone_number,
                    'nip' => $user->nip_nik ?? '-',
                    'nik' => $detail?->nik ?? '-',
                    'nia' => $detail?->nia_nrp ?? '-',
                    'nia' => $detail?->nia_nrp ?? '-',
                    'position' => $detail?->jabatanRole?->nama ?? '-',
                    'pangkat' => $detail?->pangkat?->nama ?? '-',
                    'detail' => $detail ? [
                        'tempat_lahir' => $detail->tempat_lahir,
                        'tanggal_lahir' => $detail->tanggal_lahir,
                        'jenis_kelamin' => $detail->jenis_kelamin,
                        'alamat' => $detail->alamat_domisili_lengkap,
                        'nomor_kta' => $detail->nomor_kta,
                        'kta_expired_at' => $detail->kta_expired_at?->format('Y-m-d'),
                        'is_kta_lifetime' => $detail->is_kta_lifetime,
                        'foto_profil' => $detail->foto_profil ? \Illuminate\Support\Facades\Storage::url($detail->foto_profil) : null,
                        'scan_ktp' => $detail->scan_ktp ? \Illuminate\Support\Facades\Storage::url($detail->scan_ktp) : null,
                        'scan_kta' => $detail->scan_kta ? \Illuminate\Support\Facades\Storage::url($detail->scan_kta) : null,
                        'scan_sk' => $detail->scan_sk ? \Illuminate\Support\Facades\Storage::url($detail->scan_sk) : null,
                        'tanda_tangan' => $detail->tanda_tangan ? \Illuminate\Support\Facades\Storage::url($detail->tanda_tangan) : null,
                        'suku' => $detail->suku?->nama,
                        'bangsa' => $detail->bangsa?->nama,
                        'agama' => $detail->agama?->nama,
                        'status_pernikahan' => $detail->statusPernikahan?->nama,
                        'nama_ibu_kandung' => $detail->nama_ibu_kandung,
                    ] : null,
                    'jabatan' => [
                        'id' => $detail?->jabatan_id ?? 0,
                        'nama' => $detail?->jabatan?->nama ?? '-',
                    ],
                    'tanggal_masuk' => $user->created_at->format('Y-m-d'),
                    'role' => $user->roles->first()?->name ?? 'staff',
                    'status' => $user->verifikasi == '1' ? 'active' : 'inactive',
                ];
            });

            $pendingCount = User::where('member_type', 'anggota')
                ->where('verifikasi', 0)
                ->whereNull('rejection_reason')
                ->whereHas('member')
                ->count();

            return Inertia::render('StaffMapping/Index', [
                'staff' => $users,
                'jabatan' => $jabatanList,
                'roles' => $roles,
                'filters' => $request->only(['search']),
                'pendingCount' => $pendingCount,
                'pageTitle' => 'Data Anggota',
                'pageDescription' => 'Kelola tim dan verifikasi akun anggota karyawan baru.',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in StaffController::index: ' . $e->getMessage());
            throw $e;
        }
    }

    public function calonIndex(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('StaffController::calonIndex accessed');
            $query = User::with(['roles', 'calon.suku', 'calon.bangsa', 'calon.agama', 'calon.statusPernikahan', 'calon.golonganDarah'])
                ->where('member_type', 'calon_anggota')
                ->whereDoesntHave('roles', function ($q) {
                    $q->where('name', 'super-admin');
                })
                ->where('verifikasi', true);

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('detail', function ($q) use ($search) {
                            $q->where('nip', 'like', "%{$search}%")
                                ->orWhere('nia_nrp', 'like', "%{$search}%");
                        });
                });
            }

            // Get master data for dropdowns
            $jabatanList = Jabatan::active()->orderBy('nama')->get();
            $roles = \App\Models\Role::orderBy('name')->get();

            $users = $query->orderBy('name')->get()->map(function ($user) {
                $detail = $user->calon;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone_number,
                    'nip' => $user->nip_nik ?? '-',
                    'nik' => $detail?->nik ?? '-',
                    'nia' => $detail?->nia_nrp ?? '-',
                    'position' => '-',
                    'pangkat' => '-',
                    'detail' => $detail ? [
                        'tempat_lahir' => $detail->tempat_lahir,
                        'tanggal_lahir' => $detail->tanggal_lahir,
                        'jenis_kelamin' => $detail->jenis_kelamin,
                        'alamat' => $detail->alamat_domisili_lengkap,
                        'nomor_kta' => $detail->nomor_kta ?? '-',
                        'kta_expired_at' => null,
                        'is_kta_lifetime' => false,
                        'foto_profil' => $detail->foto_profil ? \Illuminate\Support\Facades\Storage::url($detail->foto_profil) : null,
                        'scan_ktp' => $detail->scan_ktp ? \Illuminate\Support\Facades\Storage::url($detail->scan_ktp) : null,
                        'scan_kta' => null,
                        'scan_sk' => null,
                        'tanda_tangan' => $detail->tanda_tangan ? \Illuminate\Support\Facades\Storage::url($detail->tanda_tangan) : null,
                        'suku' => $detail->suku?->nama,
                        'bangsa' => $detail->bangsa?->nama,
                        'agama' => $detail->agama?->nama,
                        'status_pernikahan' => $detail->statusPernikahan?->nama,
                        'nama_ibu_kandung' => $detail->nama_ibu_kandung,
                    ] : null,
                    'jabatan' => [
                        'id' => 0,
                        'nama' => '-',
                    ],
                    'tanggal_masuk' => $user->created_at->format('Y-m-d'),
                    'role' => $user->roles->first()?->name ?? 'user',
                    'status' => $user->verifikasi == '1' ? 'active' : 'inactive',
                ];
            });

             $pendingCount = User::where('member_type', 'calon_anggota')
                ->where('verifikasi', 0)
                ->whereNull('rejection_reason')
                ->whereHas('calon')
                ->count();

            return Inertia::render('StaffMapping/Index', [
                'staff' => $users,
                'jabatan' => $jabatanList,
                'roles' => $roles,
                'filters' => $request->only(['search']),
                'pendingCount' => $pendingCount,
                'pageTitle' => 'Data Calon Anggota',
                'pageDescription' => 'Kelola dan verifikasi akun untuk calon anggota.',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in StaffController::calonIndex: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'nip' => 'required|string|unique:users,nip_nik',
            'nia' => 'nullable|string|unique:users,nia_nrp',
            'jabatan_id' => 'required|exists:jabatan,id',
            'role' => 'required', // Allow any role
        ]);

        $jabatan = Jabatan::find($request->jabatan_id);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'phone_number' => $validated['phone'],
            'nip_nik' => $validated['nip'],
            'nia_nrp' => $validated['nia'],
            'is_active' => true,
        ]);

        // Update Detail with Jabatan
        $user->detail()->create([
            'jabatan_id' => $validated['jabatan_id'],
            'nia_nrp' => $validated['nia'],
            // 'nik' could be set if in form
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $staff)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$staff->id,
            'phone' => 'nullable|string|max:20',
            'nip' => 'required|string|unique:users,nip_nik,'.$staff->id,
            'nia' => 'nullable|string|unique:users,nia_nrp,'.$staff->id,
            'jabatan_id' => 'required|exists:jabatan,id',
        ]);

        $staff->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone'],
            'nip_nik' => $validated['nip'],
            'nia_nrp' => $validated['nia'],
        ]);

        // Update Detail
        $staff->detail()->updateOrCreate(
            ['user_id' => $staff->id],
            [
                'jabatan_id' => $validated['jabatan_id'],
                'nia_nrp' => $validated['nia'],
            ]
        );

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function updateRole(Request $request, User $staff)
    {
        $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        $staff->syncRoles([$request->role]);

        return back()->with('success', 'Role user berhasil diperbarui.');
    }

    public function toggleStatus(User $staff)
    {
        // Toggle Active Status (Login Capability)
        // If user wants verification status to be toggled, we should toggle 'verifikasi' instead
        // But usually toggleStatus is for ban/unban.
        // User requested 'active' status on UI relies on 'verifikasi'.
        // So let's toggle 'verifikasi' here to match expectations if this button is used.

        $newStatus = $staff->verifikasi == '1' ? '0' : '1';
        
        $updateData = [
            'verifikasi' => $newStatus,
            'is_active' => $newStatus == '1' ? true : false,
        ];

        if ($newStatus == '1') {
             $updateData['verified_at'] = now();
             $updateData['verified_by'] = auth()->id();
             $updateData['verification_duration'] = $staff->created_at ? $staff->created_at->diffInSeconds(now()) : 0;
        }

        $staff->update($updateData);

        return back()->with('success', 'Status user berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $staff)
    {
        $staff->delete();

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil dihapus.');
    }
}
