<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMember;
use App\Models\UserCalon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ValidationController extends Controller
{
    /**
     * Cek apakah NIK sudah digunakan oleh user lain
     */
    public function checkNik(Request $request)
    {
        $nik = $request->input('nik');
        $userId = Auth::id();

        // Check both tables
        $existsInMember = UserMember::where('nik', $nik)
            ->where('user_id', '!=', $userId)
            ->exists();
            
        $existsInCalon = UserCalon::where('nik', $nik)
            ->where('user_id', '!=', $userId)
            ->exists();

        $exists = $existsInMember || $existsInCalon;

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'NIK sudah terdaftar' : 'NIK tersedia',
        ]);
    }

    /**
     * Cek apakah NRP sudah digunakan oleh user lain
     */
    public function checkNiaNrp(Request $request)
    {
        $niaNrp = $request->input('nia_nrp');
        $userId = Auth::id();

        // Only check UserMember table (anggota only)
        $exists = UserMember::where('nia_nrp', $niaNrp)
            ->where('user_id', '!=', $userId)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'NRP sudah terdaftar' : 'NRP tersedia',
        ]);
    }

    /**
     * Cek apakah Nomor KTA sudah digunakan oleh user lain
     */
    public function checkNomorKta(Request $request)
    {
        $nomorKta = $request->input('nomor_kta');
        $userId = Auth::id();

        // Only check UserMember table (anggota only)
        $exists = UserMember::where('nomor_kta', $nomorKta)
            ->where('user_id', '!=', $userId)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Nomor KTA sudah terdaftar' : 'Nomor KTA tersedia',
        ]);
    }

    /**
     * Check general user registration input (email, username, phone)
     */
    public function checkRegisterInput(Request $request)
    {
        $request->validate([
            'field' => 'required|in:email,username,phone_number',
            'value' => 'required|string',
        ]);

        $field = $request->field;
        $value = $request->value;
        $userId = Auth::id(); // Optional: if checking while logged in (e.g. edit profile)

        $query = \App\Models\User::where($field, $value);

        if ($userId) {
            $query->where('id', '!=', $userId);
        }

        $exists = $query->exists();

        $label = match($field) {
            'email' => 'Email',
            'username' => 'Username',
            'phone_number' => 'Nomor telepon',
            default => $field
        };

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? "$label sudah terdaftar" : "$label tersedia",
        ]);
    }
}
