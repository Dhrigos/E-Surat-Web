<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Jabatan;
use App\Models\Pangkat;
use App\Models\UnitKerja;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class StaffController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view staff', only: ['index']),
            new Middleware('permission:edit staff', only: ['update']),
            new Middleware('permission:delete staff', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $query = User::with(['roles', 'detail.jabatan', 'detail.unitKerja', 'detail.pangkat']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('detail', function($q) use ($search) {
                      $q->where('nip', 'like', "%{$search}%")
                        ->orWhere('nia_nrp', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by unit (department)
        if ($request->has('unit_kerja_id') && $request->unit_kerja_id !== 'all') {
             $query->whereHas('detail', function($q) use ($request) {
                 $q->where('unit_kerja_id', $request->unit_kerja_id);
             });
        }

        // Get master data for dropdowns
        $jabatanList = Jabatan::active()->orderBy('nama')->get();
        $pangkatList = Pangkat::active()->ordered()->get();
        $unitKerjaList = UnitKerja::active()->orderBy('nama')->get();
        
        $users = $query->orderBy('name')->get()->map(function ($user) {
            $detail = $user->detail;
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone_number, // Or $detail->phone if moved there
                'nip' => $user->nip_nik ?? '-',
                'nik' => $detail?->nik ?? '-',
                'nia' => $detail?->nia_nrp ?? '-',
                'pangkat' => [
                    'id' => $detail?->pangkat_id ?? 0, 
                    'nama' => $detail?->pangkat?->nama ?? '-'
                ],
                'jabatan' => [
                    'id' => $detail?->jabatan_id ?? 0, 
                    'nama' => $detail?->jabatan?->nama ?? '-'
                ],
                'unit_kerja' => [
                    'id' => $detail?->unit_kerja_id ?? 0, 
                    'nama' => $detail?->unitKerja?->nama ?? '-'
                ],
                'status_keanggotaan' => ['id' => 0, 'nama' => 'Active'], // Dummy
                'tanggal_masuk' => $user->created_at->format('Y-m-d'),
                'role' => $user->roles->first()?->name ?? 'staff',
                'status' => $user->is_active ? 'active' : 'inactive',
            ];
        });

        $statusKeanggotaan = \App\Models\StatusKeanggotaan::orderBy('nama')->get();
        $roles = \Spatie\Permission\Models\Role::with('permissions')->orderBy('name')->get();
        $permissions = \Spatie\Permission\Models\Permission::orderBy('name')->get();

        return Inertia::render('StaffMapping/Index', [
            'staff' => $users,
            'jabatan' => $jabatanList,
            'pangkat' => $pangkatList,
            'unitKerja' => $unitKerjaList,
            'statusKeanggotaan' => $statusKeanggotaan,
            'roles' => $roles,
            'permissions' => $permissions,
            'filters' => $request->only(['search', 'unit_kerja_id']),
        ]);
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
            'pangkat_id' => 'required|exists:pangkat,id',
            'jabatan_id' => 'required|exists:jabatan,id',
            'unit_kerja_id' => 'required|exists:unit_kerja,id',
            'role' => 'required|in:staff,supervisor,manager',
        ]);

        // Map IDs back to names
        $pangkat = Pangkat::find($request->pangkat_id);
        $jabatan = Jabatan::find($request->jabatan_id);
        $unit = UnitKerja::find($request->unit_kerja_id);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'phone_number' => $validated['phone'],
            'nip_nik' => $validated['nip'],
            'nia_nrp' => $validated['nia'],
            'pangkat_golongan' => $pangkat ? $pangkat->nama : null,
            'jabatan' => $jabatan ? $jabatan->nama : null,
            'department' => $unit ? $unit->nama : null,
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil ditambahkan.');
    }
    public function update(Request $request, User $staff)
    {
        // $staff is actually a User model because of route model binding if we change route key or just use User $user
        // But route param is probably {staff}, so we might need to explicit bind or just use $id
        // Let's assume we change the type hint to User and Laravel resolves it if the ID exists in users table.
        // Note: Route is resource('staff', ...). Param is {staff}.
        // If we type hint User $staff, Laravel will try to find User with ID {staff}. This works.

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->id,
            'phone' => 'nullable|string|max:20',
            'nip' => 'required|string|unique:users,nip_nik,' . $staff->id,
            'nia' => 'nullable|string|unique:users,nia_nrp,' . $staff->id,
            'pangkat_id' => 'required|exists:pangkat,id',
            'jabatan_id' => 'required|exists:jabatan,id',
            'unit_kerja_id' => 'required|exists:unit_kerja,id',
            // 'status_keanggotaan_id' => 'required|exists:status_keanggotaans,id', // User doesn't have this
            // 'tanggal_masuk' => 'required|date', // User doesn't have this
            'role' => 'required|in:staff,supervisor,manager',
            // 'status' => 'required|in:active,inactive', // User doesn't have this
        ]);

        // Map IDs back to names
        $pangkat = Pangkat::find($request->pangkat_id);
        $jabatan = Jabatan::find($request->jabatan_id);
        $unit = UnitKerja::find($request->unit_kerja_id);

        $staff->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone'],
            'nip_nik' => $validated['nip'],
            'nia_nrp' => $validated['nia'],
            'pangkat_golongan' => $pangkat ? $pangkat->nama : null,
            'jabatan' => $jabatan ? $jabatan->nama : null,
            'department' => $unit ? $unit->nama : null,
        ]);

        $staff->syncRoles([$validated['role']]);

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function toggleStatus(User $staff)
    {
        $staff->update([
            'is_active' => !$staff->is_active
        ]);

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
