<?php

namespace App\Http\Controllers\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\Mitra;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class MitraAdminController extends Controller
{
    public function index(Mitra $mitra)
    {
        return response()->json([
            'admins' => $mitra->users()->get()
        ]);
    }

    public function store(Request $request, Mitra $mitra)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',      // Uppercase
                'regex:/[0-9]/',      // Number
                'regex:/[!@#$%^&*]/', // Special char
            ],
        ], [
            'username.unique' => 'Username sudah digunakan oleh user lain.',
            'email.unique' => 'Email sudah terdaftar di sistem.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, angka, dan karakter spesial.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mitra_id' => $mitra->id,
            'is_active' => true,
            'verifikasi' => true, // Auto verified
        ]);

        // Ensure role exists and assign
        $role = Role::firstOrCreate(['name' => 'mitra-admin']);
        $user->assignRole($role);

        return back()->with('success', 'Admin Mitra berhasil ditambahkan');
    }

    public function destroy(Mitra $mitra, User $user)
    {
        if ($user->mitra_id !== $mitra->id) {
            abort(403);
        }

        $user->delete();

        return back()->with('success', 'Admin Mitra berhasil dihapus');
    }
}
