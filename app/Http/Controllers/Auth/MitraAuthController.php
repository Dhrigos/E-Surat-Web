<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Mitra;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MitraAuthController extends Controller
{
    /**
     * Show the application's login form for Mitra.
     *
     * @return \Inertia\Response
     */
    public function loginForm()
    {
        return Inertia::render('Auth/MitraLogin');
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'code' => 'required|string|exists:mitras,code',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string',
        ]);

        // 1. Validate Mitra Code
        $mitra = Mitra::where('code', $request->code)->where('is_active', true)->first();

        if (! $mitra) {
            throw ValidationException::withMessages([
                'code' => __('Mitra tidak ditemukan atau tidak aktif.'),
            ]);
        }

        // 2. Validate User belongs to Mitra
        $user = User::where('email', $request->email)
            ->where('mitra_id', $mitra->id)
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => __('User tidak terdaftar pada mitra ini.'),
            ]);
        }

        // 3. Attempt Login
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('mitra.dashboard'));
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('mitra.login');
    }
}
