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
            // $roles = \App\Models\Role::with('permissions')->orderBy('name')->get();
            // Using string role for simple assignment as seen in existing code, but fetching roles for list is good
            $roles = \App\Models\Role::orderBy('name')->get();

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
                    'status' => $user->verifikasi == '1' ? 'active' : 'inactive',
                ];
            });

            return Inertia::render('StaffMapping/Index', [
                'staff' => $users,
                'jabatan' => $jabatanList,
                'roles' => $roles,
                'filters' => $request->only(['search']),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in StaffController::index: ' . $e->getMessage());
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
        $staff->update([
            'verifikasi' => $newStatus,
            'is_active' => $newStatus == '1' ? true : false, // Sync is_active too
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
