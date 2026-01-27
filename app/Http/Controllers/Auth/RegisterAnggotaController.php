<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisterAnggotaController extends Controller
{
    /**
     * Display the Anggota registration form.
     */
    public function showRegistrationForm()
    {
        $settings = \App\Models\SystemSetting::where('group', 'registration')->pluck('value', 'key');
        
        return Inertia::render('Auth/RegisterAnggota', [
            'settings' => $settings,
        ]);
    }

    /**
     * Handle Anggota registration request.
     */
    public function register(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'phone_number' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::defaults()],
            'otp' => 'required|string|size:6',
        ], [
            'username.unique' => 'Username sudah digunakan.',
            'email.unique' => 'Email sudah terdaftar.',
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus 6 digit.',
        ]);

        // Verify OTP from Cache
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_reg_' . $validated['email']);
        
        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            return back()->withErrors(['otp' => 'Kode OTP tidak valid atau sudah kadaluarsa.']);
        }

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'member_type' => 'anggota',
            'is_verified' => false,
        ]);

        // Assign role 'staff' to Anggota
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $user->assignRole($role);

        // Clear OTP from cache
        \Illuminate\Support\Facades\Cache::forget('otp_reg_' . $validated['email']);

        // Redirect to login page (no auto-login, user must login manually then do eKYC)
        return redirect()->route('login')->with('status', 'Registrasi berhasil! Silakan login.');
    }
}
