<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDetail;
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

        $exists = UserDetail::where('nik', $nik)
            ->where('user_id', '!=', $userId)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'NIK sudah terdaftar' : 'NIK tersedia',
        ]);
    }

    /**
     * Cek apakah NIA/NRP sudah digunakan oleh user lain
     */
    public function checkNiaNrp(Request $request)
    {
        $niaNrp = $request->input('nia_nrp');
        $userId = Auth::id();

        $exists = UserDetail::where('nia_nrp', $niaNrp)
            ->where('user_id', '!=', $userId)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'NIA/NRP sudah terdaftar' : 'NIA/NRP tersedia',
        ]);
    }

    /**
     * Cek apakah Nomor KTA sudah digunakan oleh user lain
     */
    public function checkNomorKta(Request $request)
    {
        $nomorKta = $request->input('nomor_kta');
        $userId = Auth::id();

        $exists = UserDetail::where('nomor_kta', $nomorKta)
            ->where('user_id', '!=', $userId)
            ->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Nomor KTA sudah terdaftar' : 'Nomor KTA tersedia',
        ]);
    }
}
