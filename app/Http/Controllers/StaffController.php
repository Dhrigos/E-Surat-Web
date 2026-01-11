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
            new Middleware('permission:view staff', only: ['index']),
            new Middleware('permission:edit staff', only: ['update']),
            new Middleware('permission:delete staff', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        $query = User::with(['roles', 'detail.jabatan']);

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
        // $roles = \Spatie\Permission\Models\Role::with('permissions')->orderBy('name')->get();
        // Using string role for simple assignment as seen in existing code, but fetching roles for list is good
        $roles = \Spatie\Permission\Models\Role::orderBy('name')->get();

        $users = $query->orderBy('name')->get()->map(function ($user) {
            $detail = $user->detail;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone_number,
                'nip' => $user->nip_nik ?? '-',
                'nik' => $detail?->nik ?? '-',
                'nia' => $detail?->nia_nrp ?? '-',
                'jabatan' => [
                    'id' => $detail?->jabatan_id ?? 0,
                    'nama' => $detail?->jabatan?->nama ?? '-',
                ],
                'tanggal_masuk' => $user->created_at->format('Y-m-d'),
                'role' => $user->roles->first()?->name ?? 'staff',
                'status' => $user->is_active ? 'active' : 'inactive',
            ];
        });

        return Inertia::render('StaffMapping/Index', [
            'staff' => $users,
            'jabatan' => $jabatanList,
            'roles' => $roles,
            'filters' => $request->only(['search']),
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
            'role' => 'required',
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

        $staff->syncRoles([$validated['role']]);

        return redirect()->route('staff.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function toggleStatus(User $staff)
    {
        $staff->update([
            'is_active' => ! $staff->is_active,
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
